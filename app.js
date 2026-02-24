import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
  name: "",
  model: "Random Forest",
  car_age: "",   // ✅ use this
  km_driven: "",
  fuel: "Petrol",
  seller_type: "Dealer",
  transmission: "Manual",
  seats: "",
  owner: "First Owner",
  actual_price: ""
});

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const predict = async () => {
  setLoading(true);
  setResult(null);

  try {
    const response = await axios.post(
      "http://127.0.0.1:5000/predict",
      formData
    );

    setResult(response.data);
  } catch (error) {
    console.error(error.response || error);
    alert("Backend error or not connected!");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="container">
      <h1 className="main-title">🚗 Car Price Prediction System</h1>

      <div className="dashboard">

        {/* MODEL CARD */}
        <div className="card">
          <h2>Select Algorithm</h2>

          <select
            name="model"
            value={formData.model}
            onChange={handleChange}
          >
            <option>Linear Regression</option>
            <option>Random Forest</option>
            <option>XGBoost</option>
            <option>SVM</option>
          </select>

          {result && (
            <div className="best-model">
              <h3>🏆 Best Model (Highest R²)</h3>
              <p>{result.best_model}</p>
            </div>
          )}
        </div>

        {/* INPUT CARD */}
        <div className="card">
          <h2>Car Details</h2>

          <input
            type="text"
            name="name"
            placeholder="Car Name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="number"
            name="car_age"
            placeholder="Car Age"
            value={formData.car_age}
            onChange={handleChange}
          />

          <input
            type="number"
            name="km_driven"
            placeholder="KM Driven"
            value={formData.km_driven}
            onChange={handleChange}
          />

          <select
            name="fuel"
            value={formData.fuel}
            onChange={handleChange}
          >
            <option>Petrol</option>
            <option>Diesel</option>
            <option>CNG</option>
            <option>LPG</option>
          </select>

          <select
            name="seller_type"
            value={formData.seller_type}
            onChange={handleChange}
          >
            <option>Dealer</option>
            <option>Individual</option>
          </select>

          <select
            name="transmission"
            value={formData.transmission}
            onChange={handleChange}
          >
            <option>Manual</option>
            <option>Automatic</option>
          </select>

          <input
            type="number"
            name="seats"
            placeholder="Seats"
            value={formData.seats}
            onChange={handleChange}
          />

          {/* OWNER FIELD (NEW) */}
          <select
            name="owner"
            value={formData.owner}
            onChange={handleChange}
          >
            <option>First Owner</option>
            <option>Second Owner</option>
            <option>Third Owner</option>
            <option>Fourth & Above Owner</option>
            <option>Test Drive Car</option>
          </select>

          <input
            type="number"
            name="actual_price"
            placeholder="Actual Price"
            value={formData.actual_price}
            onChange={handleChange}
          />

          <button onClick={predict} disabled={loading}>
            {loading ? "Predicting..." : "Predict Price"}
          </button>
        </div>

        {/* METRICS CARD */}
        <div className="card">
          <h2>Model Performance</h2>

          {result ? (
            <>
              <p><strong>R²:</strong> {result.r2_score}</p>
              <p><strong>MAE:</strong> ₹ {result.mae}</p>
              <p><strong>RMSE:</strong> ₹ {result.rmse}</p>
            </>
          ) : (
            <p>No metrics yet</p>
          )}
        </div>
      </div>

      {/* RESULT SECTION */}
      {result && (
        <div className="prediction-box">
          <h2>{result.name}</h2>

          <h1>
            Predicted Price: ₹{" "}
            {Number(result.predicted_price).toLocaleString("en-IN")}
          </h1>

          <h3>Actual Price: ₹ {result.actual_price}</h3>
          <h3>In Lakhs: ₹ {result.predicted_price_lakhs} L</h3>

          <h3 style={{ marginTop: "15px" }}>
            🏆 Best Model: {result.best_model}
          </h3>
        </div>
      )}
    </div>
  );
}

export default App;
