import pandas as pd
import requests
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from flask import Flask, jsonify, request

# Tạo Flask API
app = Flask(__name__)

# Hàm gọi API để lấy dữ liệu đánh giá
def fetch_ratings_data(api_url):
    response = requests.get(api_url)
    if response.status_code == 200:
        return response.json()  # Dữ liệu API trả về dạng JSON
    else:
        raise Exception(f"Failed to fetch data from API. Status code: {response.status_code}")

# Hàm gợi ý món ăn
def recommend_food(client_id, num_recommendations, api_url):
    try:
        # Lấy dữ liệu từ API
        data = fetch_ratings_data(api_url)
        ratings = pd.DataFrame(data)

        # Xử lý các bản ghi trùng lặp: tính trung bình của các đánh giá cho mỗi (clientID, dishID)
        ratings = ratings.groupby(['clientID', 'dishID'], as_index=False)['ratingStar'].mean()

        # Pivot table để tạo ma trận người dùng - món ăn
        user_food_ratings = ratings.pivot(index='clientID', columns='dishID', values='ratingStar')

        # Xử lý dữ liệu NaN và chuẩn hóa
        imputer = SimpleImputer(strategy="constant", fill_value=0)
        user_food_ratings_filled = imputer.fit_transform(user_food_ratings)

        scaler = StandardScaler()
        user_food_ratings_scaled = scaler.fit_transform(user_food_ratings_filled)

        # Tính độ tương đồng cosine
        similarity_matrix = cosine_similarity(user_food_ratings_scaled)

        # Gợi ý món ăn
        user_index = user_food_ratings.index.tolist().index(client_id)
        user_similarity = similarity_matrix[user_index]
        similar_users_indices = user_similarity.argsort()[::-1][1:num_recommendations+1]
        similar_users_ratings = user_food_ratings.iloc[similar_users_indices]
        recommended_foods = similar_users_ratings.mean(axis=0).sort_values(ascending=False)

        # Loại bỏ các món đã được đánh giá bởi người dùng
        user_rated_foods = user_food_ratings.iloc[user_index].dropna().index
        recommended_foods = recommended_foods.drop(user_rated_foods, errors='ignore')

        return recommended_foods.head(num_recommendations).index.tolist()
    except Exception as e:
        return {"error": str(e)}

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()
        client_id = data.get('clientID')
        num_recommendations = data.get('numRecommendations', 5)
        api_url = data.get('apiURL')  # URL của API để lấy dữ liệu

        recommendations = recommend_food(client_id, num_recommendations, api_url)
        return jsonify({"recommendations": recommendations})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
