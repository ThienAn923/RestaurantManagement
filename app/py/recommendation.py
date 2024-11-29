import pandas as pd
import requests
from flask import Flask, jsonify, request

# Tạo Flask API
app = Flask(__name__)

# Hàm gọi API để lấy dữ liệu
def fetch_data(api_url):
    response = requests.get(api_url)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to fetch data from API. Status code: {response.status_code}")

# Hàm tính gợi ý món ăn
def recommend_food(client_id, num_recommendations, rating_url, invoice_url, dish_url):
    try:
        ratings_data = fetch_data(rating_url)
        invoice_data = fetch_data(invoice_url)
        dish = fetch_data(dish_url)
        dish_data = dish["data"]
        ratings_df = pd.DataFrame(ratings_data)
        ratings_df = ratings_df.groupby(['dishID'], as_index=False)['ratingStar'].mean()  
        dish_df = pd.DataFrame(dish_data)
        invoice_df = pd.DataFrame(invoice_data)

        # Lọc các hóa đơn của khách hàng theo clientId
        client_invoices = invoice_df[invoice_df['clientId'] == client_id]
        if client_invoices.empty:
            raise Exception("No invoices found for the given client ID.")
        
        eaten_dishes = []
        for details in client_invoices['invoiceDetail_list']:
            # Duyệt qua từng chi tiết hóa đơn và lấy dishID từ Dish (các món đã ăn)
            eaten_dishes.extend([detail['Dish']['id'] for detail in details])

        eaten_dishes_df = pd.DataFrame({'dishID': eaten_dishes})

        # Kết hợp rating và món đã ăn
        ratings_df['isEaten'] = ratings_df['dishID'].isin(eaten_dishes_df['dishID'])
        
        # Thêm điểm ưu tiên cho món đã ăn (tăng điểm cho món đã ăn)
        ratings_df['recommendScore'] = ratings_df['ratingStar'] + ratings_df['isEaten'] * 2
        
        # Nếu không có món đã ăn, gợi ý các món phổ biến nhất (theo số lượt order)
        if eaten_dishes_df.empty:
            popular_dishes = ratings_df.sort_values(by='ratingStar', ascending=False).head(num_recommendations)
            return popular_dishes['dishID'].tolist()
        
        # Thêm thông tin dishType vào DataFrame
        ratings_df = pd.merge(ratings_df, dish_df[['id', 'dishType']], left_on='dishID', right_on='id', how='left')
        
        # Tạo cột gợi ý món tương tự dựa trên dishType
        recommendations = []
        for dish_id in eaten_dishes_df['dishID']:
            dish_type = dish_df[dish_df['id'] == dish_id]['dishType'].iloc[0]
            similar_dishes = ratings_df[ratings_df['dishType'] == dish_type]
            recommendations.append(similar_dishes.sort_values(by='recommendScore', ascending=False).head(num_recommendations))
        
        # Kết hợp tất cả các gợi ý món
        all_recommendations = all_recommendations.sort_values(by='recommendScore', ascending=False).head(num_recommendations)        
        return all_recommendations['dishID'].tolist()

    except Exception as e:
        return {"error": str(e)}

# Endpoint Flask
@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()
        client_id = data.get('clientID')
        num_recommendations = data.get('numRecommendations', 5)
        rating_url = data.get('ratingURL')
        invoice_url = data.get('invoiceURL')
        dish_url = data.get('dishURL')

        recommendations = recommend_food(client_id, num_recommendations, rating_url, invoice_url, dish_url)
        return jsonify({"recommendations": recommendations})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)