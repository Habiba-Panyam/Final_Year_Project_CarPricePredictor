from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd

app = Flask(__name__)
CORS(app)

# ==============================
# LOAD TRAINED FILES
# ==============================
models = joblib.load("models/all_models.pkl")
scaler = joblib.load("models/scaler.pkl")
model_metrics = joblib.load("models/metrics.pkl")
feature_columns = joblib.load("models/feature_columns.pkl")

# ==============================
# ENCODING MAPS (Same as training)
# ==============================
fuel_map = {"Petrol": 0, "Diesel": 1, "CNG": 2, "LPG": 3}
seller_map = {"Dealer": 0, "Individual": 1}
transmission_map = {"Manual": 0, "Automatic": 1}
owner_map = {
    "First Owner": 0,
    "Second Owner": 1,
    "Third Owner": 2,
    "Fourth & Above Owner": 3,
    "Test Drive Car": 4
}

# ==============================
# HOME ROUTE
# ==============================
@app.route("/")
def home():
    return "Car Price Prediction Backend Running"

# ==============================
# PREDICTION ROUTE
# ==============================
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json

        selected_model_name = data.get("model")

        if selected_model_name not in models:
            return jsonify({"error": "Invalid model selected"}), 400

        model = models[selected_model_name]

        # ==============================
        # EXTRACT INPUT
        # ==============================
        name = data.get("name", "")
        brand = name.split()[0] if name else "Unknown"

        car_age = float(data.get("car_age", 0))
        km_driven = float(data.get("km_driven", 0))
        seats = float(data.get("seats", 0))
        actual_price = float(data.get("actual_price", 0))

        # ==============================
        # CREATE INPUT DICTIONARY
        # ==============================
        input_dict = {
            "car_age": car_age,
            "km_driven": km_driven,
            "actual_price": actual_price,
            "seats": seats,
            "fuel": data.get("fuel"),
            "seller_type": data.get("seller_type"),
            "transmission": data.get("transmission"),
            "owner": data.get("owner"),
            "brand": brand
        }

        input_df = pd.DataFrame([input_dict])

        # ==============================
        # APPLY SAME PREPROCESSING
        # ==============================
        input_df["fuel"] = input_df["fuel"].map(fuel_map)
        input_df["seller_type"] = input_df["seller_type"].map(seller_map)
        input_df["transmission"] = input_df["transmission"].map(transmission_map)
        input_df["owner"] = input_df["owner"].map(owner_map)

        # One-hot encoding
        input_df = pd.get_dummies(input_df)

        # Add missing columns
        for col in feature_columns:
            if col not in input_df.columns:
                input_df[col] = 0

        # Ensure exact order
        input_df = input_df[feature_columns]

        input_data = input_df.values

        # ==============================
        # SCALE IF REQUIRED
        # ==============================
        if selected_model_name in ["Linear Regression", "SVM"]:
            input_processed = scaler.transform(input_data)
        else:
            input_processed = input_data

        # ==============================
        # PREDICT
        # ==============================
        prediction_log = model.predict(input_processed)[0]
        prediction = np.expm1(prediction_log)

        best_model = max(model_metrics, key=lambda x: model_metrics[x]["r2"])

        return jsonify({
            "name": name,
            "actual_price": actual_price,
            "predicted_price": round(float(prediction), 2),
            "predicted_price_lakhs": round(float(prediction) / 100000, 2),
            "r2_score": model_metrics[selected_model_name]["r2"],
            "mae": model_metrics[selected_model_name]["mae"],
            "rmse": model_metrics[selected_model_name]["rmse"],
            "best_model": best_model
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==============================
# RUN SERVER
# ==============================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
