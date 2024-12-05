import pandas as pd
import requests
from flask import Flask, jsonify, request
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Tạo Flask API
app = Flask(__name__)

# Hàm gọi API để lấy dữ liệu
def fetch_data(api_url):
    response = requests.get(api_url)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to fetch data from API. Status code: {response.status_code}")

# Hàm tính gợi ý món ăn sử dụng cosine_similarity
def recommend_food(client_id, num_recommendations, rating_url, invoice_url, dish_url):
    try:
        # Lấy dữ liệu từ API
        ratings_data = fetch_data(rating_url)
        invoice_data = fetch_data(invoice_url)
        dish = fetch_data(dish_url)
        dish_data = dish["data"]

        # Chuyển đổi dữ liệu thành DataFrame
        ratings_df = pd.DataFrame(ratings_data)
        invoice_df = pd.DataFrame(invoice_data)
        dish_df = pd.DataFrame(dish_data)

        # Lọc các hóa đơn của khách hàng theo clientId
        client_invoices = invoice_df[invoice_df['clientId'] == client_id]
        if client_invoices.empty:
            # Nếu không có hóa đơn cho client, gợi ý các món phổ biến nhất
            popular_dishes = ratings_df.groupby('dishID')['ratingStar'].mean().sort_values(ascending=False).head(num_recommendations).index.tolist()
            return popular_dishes

        # Tạo danh sách món đã ăn từ hóa đơn của khách hàng
        eaten_dishes = []
        for details in client_invoices['invoiceDetail_list']:
            eaten_dishes.extend([detail['Dish']['id'] for detail in details])

        # Tạo ma trận người dùng - món ăn
        user_dish_matrix = ratings_df.pivot_table(index='clientID', columns='dishID', values='ratingStar', fill_value=0)
        
        # Tính toán sự tương đồng giữa các người dùng (user-user similarity)
        user_similarity = cosine_similarity(user_dish_matrix)
        user_ids = user_dish_matrix.index
        user_similarity_df = pd.DataFrame(user_similarity, index=user_ids, columns=user_ids)

        # Tìm người dùng tương tự nhất với client_id
        similar_users = user_similarity_df[client_id].sort_values(ascending=False).head(6).index.tolist()  # 5 người dùng tương tự nhất
        # Tạo danh sách món ăn mà những người dùng tương tự đã đánh giá cao
        
        recommended_dishes = []
        for user in similar_users:
            if user != client_id:  # Tránh sử dụng chính người dùng đó
                user_ratings = user_dish_matrix.loc[user]
                # Lọc các món ăn người dùng này đã đánh giá cao nhưng khách hàng chưa ăn
                user_recommendations = user_ratings[user_ratings >= 4].index.tolist()  # Chọn món có điểm đánh giá từ 4 trở lên
                recommended_dishes.extend([dish_id for dish_id in user_recommendations])
                print(recommended_dishes)
        # Loại bỏ trùng lặp
        recommended_dishes = list(dict.fromkeys(recommended_dishes))  # Loại bỏ trùng lặp

        # Nếu không đủ gợi ý, tìm các món ăn phổ biến nhất mà người dùng chưa thử
        if len(recommended_dishes) < num_recommendations:
            popular_dishes = ratings_df.groupby('dishID').size().sort_values(ascending=False).head(num_recommendations).index.tolist()
            recommended_dishes.extend([dish_id for dish_id in popular_dishes if dish_id not in eaten_dishes])

        # Chọn số lượng gợi ý cần thiết
        recommended_dishes = recommended_dishes[:num_recommendations]

        # Lấy thông tin món ăn gợi ý
        recommended_dishes_info = dish_df[dish_df['id'].isin(recommended_dishes)]
        return recommended_dishes_info['id'].tolist()

    except Exception as e:
        return {"error": str(e)}

# Endpoint Flask
@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()
        client_id = data.get('clientID')
        num_recommendations = data.get('numRecommendations', 5)
        rating_url = data.get('ratingUrl')
        invoice_url = data.get('invoiceUrl')
        dish_url = data.get('dishUrl')

        recommendations = recommend_food(client_id, num_recommendations, rating_url, invoice_url, dish_url)
        return jsonify({"recommendations": recommendations})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
