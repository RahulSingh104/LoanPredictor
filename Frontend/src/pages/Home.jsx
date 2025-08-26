import React, { useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [formData, setFormData] = useState({
    no_of_dependents: '',
    education: '',
    self_employed: '',
    income_annum: '',
    loan_amount: '',
    loan_term: '',
    cibil_score: '',
    residential_assets_value: '',
    commercial_assets_value: '',
    luxury_assets_value: '',
    bank_asset_value: '',
  });

  const [prediction, setPrediction] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic form validation
    for (const [key, value] of Object.entries(formData)) {
      if (value === '') {
        setErrorMessage(`Please fill in the "${key.replace(/_/g, ' ')}" field.`);
        return;
      }
    }

    try {
      const res = await axios.post('http://localhost:5001/predict', formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      // If backend returns 1/0 instead of Approved/Rejected
      let result = res.data.prediction;
      if (result === 1) result = 'Approved';
      else if (result === 0) result = 'Rejected';

      setPrediction(result);
      setErrorMessage('');
    } catch (error) {
      console.error('Error while predicting:', error);
      setPrediction(null);
      setErrorMessage('Error predicting result. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Loan Application</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* No of Dependents */}
          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">No of Dependents</label>
            <input
              type="number"
              name="no_of_dependents"
              value={formData.no_of_dependents}
              onChange={handleChange}
              placeholder="Enter number of dependents"
              className="w-full border rounded-md px-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none"
            />
          </div>

          {/* Education */}
          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Education</label>
            <select
              name="education"
              value={formData.education}
              onChange={handleChange}
              className="w-full border rounded-md px-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none"
            >
              <option value="">Select education</option>
              <option value="Graduate">Graduate</option>
              <option value="Not Graduate">Not Graduate</option>
            </select>
          </div>

          {/* Self Employed */}
          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Self Employed</label>
            <select
              name="self_employed"
              value={formData.self_employed}
              onChange={handleChange}
              className="w-full border rounded-md px-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none"
            >
              <option value="">Select employment status</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {/* Remaining inputs */}
          {[
            { name: 'income_annum', label: 'Income Annum' },
            { name: 'loan_amount', label: 'Loan Amount' },
            { name: 'loan_term', label: 'Loan Term' },
            { name: 'cibil_score', label: 'CIBIL Score' },
            { name: 'residential_assets_value', label: 'Residential Assets Value' },
            { name: 'commercial_assets_value', label: 'Commercial Assets Value' },
            { name: 'luxury_assets_value', label: 'Luxury Assets Value' },
            { name: 'bank_asset_value', label: 'Bank Assets Value' },
          ].map(({ name, label }) => (
            <div key={name}>
              <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">{label}</label>
              <input
                type="number"
                name={name}
                value={formData[name]}
                onChange={handleChange}
                placeholder={`Enter ${label.toLowerCase()}`}
                className="w-full border rounded-md px-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none"
              />
            </div>
          ))}

          {/* Error Message */}
          {errorMessage && (
            <p className="text-red-500 text-sm font-medium">{errorMessage}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700"
          >
            Predict Loan Approval
          </button>

          {/* Prediction Output */}
          {prediction && (
            <div className="text-center text-sm mt-4 font-medium">
              <p className="text-gray-800 dark:text-gray-200">Prediction Result</p>
              <p className={`font-semibold ${prediction === 'Approved' ? 'text-green-600' : 'text-red-600'}`}>
                {prediction}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Home;
