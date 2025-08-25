// import React, { useState } from "react";
// import { toast } from "react-toastify";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const API_URL = import.meta.env.VITE_API_URL; // ✅ Base backend URL only

// const InputField = ({ label, ...props }) => (
//   <div>
//     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//       {label}
//     </label>
//     <input
//       {...props}
//       className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
//     />
//   </div>
// );

// const SelectField = ({ label, options, ...props }) => (
//   <div>
//     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//       {label}
//     </label>
//     <select
//       {...props}
//       className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
//     >
//       <option value="">Select...</option>
//       {options.map((opt) => (
//         <option key={opt.value} value={opt.value}>
//           {opt.label}
//         </option>
//       ))}
//     </select>
//   </div>
// );

// const PredictionForm = () => {
//   const navigate = useNavigate();

//   const checkAuthAndProceed = (callback) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       callback();
//     } else {
//       toast.info("Please log in to perform this action.");
//       navigate("/login");
//     }
//   };

//   const [formData, setFormData] = useState({
//     no_of_dependents: "",
//     education: "",
//     self_employed: "",
//     income_annum: "",
//     loan_amount: "",
//     loan_term: "",
//     cibil_score: "",
//     residential_assets_value: "",
//     commercial_assets_value: "",
//     luxury_assets_value: "",
//     bank_asset_value: "",
//   });

//   const [prediction, setPrediction] = useState(null); // Final Decision
//   const [reasons, setReasons] = useState([]);
//   const [modelPrediction, setModelPrediction] = useState(null); // Raw model prediction
//   const [modelReasons, setModelReasons] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   // 🔎 Highlight important keywords
//   const highlightReason = (reason) => {
//     const keywords = [
//       "Loan-to-Income ratio",
//       "CIBIL score",
//       "Assets",
//       "Annual income",
//       "Strong financial profile",
//     ];
//     let highlighted = reason;
//     keywords.forEach((word) => {
//       const regex = new RegExp(`(${word})`, "gi");
//       highlighted = highlighted.replace(
//         regex,
//         `<span class="font-bold text-yellow-400">$1</span>`
//       );
//     });
//     return highlighted;
//   };

//   // ✅ NEW: Save loan to backend
//   const saveLoan = async (predictionResult) => {
//     try {
//       await axios.post(
//         `${API_URL}/loan/apply`,
//         {
//           loan_amount: formData.loan_amount,
//           income_annum: formData.income_annum,
//           cibil_score: formData.cibil_score,
//           status: predictionResult, // "Approved" or "Rejected"
//           created_at: new Date().toISOString(),
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       toast.success("Loan record saved to dashboard!");
//     } catch (error) {
//       console.error("Failed to save loan:", error.response?.data || error.message);
//       toast.error("Prediction done, but saving loan failed.");
//     }
//   };

//   const runPrediction = async () => {
//     // ✅ validation
//     const isValid = Object.entries(formData).every(
//       ([_, value]) => value !== ""
//     );
//     if (!isValid) {
//       toast.error("Please fill all fields before predicting.");
//       return;
//     }

//     setLoading(true);
//     const loadingToast = toast.loading("Getting your prediction...");
//     try {
//       const res = await axios.post(`${API_URL}/predict`, formData, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });

//       // ✅ Backend returns { model_prediction, model_reasons, final_decision, final_reasons }
//       setModelPrediction(res.data.model_prediction || null);
//       setModelReasons(res.data.model_reasons || []);
//       setPrediction(res.data.final_decision || null);
//       setReasons(res.data.final_reasons || []);

//       // ✅ Save loan record automatically
//       if (res.data.final_decision) {
//         await saveLoan(res.data.final_decision);
//       }

//       // ✅ Toast with final decision
//       if (res.data.final_decision === "Approved") {
//         toast.update(loadingToast, {
//           render: res.data.final_reasons?.[0] || "Loan Approved!",
//           type: "success",
//           isLoading: false,
//           autoClose: 5000,
//         });
//       } else {
//         toast.update(loadingToast, {
//           render: res.data.final_reasons?.[0] || "Loan Rejected!",
//           type: "error",
//           isLoading: false,
//           autoClose: 5000,
//         });
//       }
//     } catch (error) {
//       const msg =
//         error.response?.data?.error ||
//         "Could not connect to the prediction server.";
//       toast.update(loadingToast, {
//         render: msg,
//         type: "error",
//         isLoading: false,
//         autoClose: 5000,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     checkAuthAndProceed(() => {
//       runPrediction();
//     });
//   };

//   return (
//     <div className="max-w-4xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6">New Loan Prediction</h1>
//       <form
//         onSubmit={handleSubmit}
//         className="dark:bg-gray-800 bg-white rounded-2xl shadow-md p-8 grid grid-cols-1 md:grid-cols-2 gap-6"
//       >
//         {/* === Input Fields === */}
//         <InputField label="No of Dependents" name="no_of_dependents" type="number" value={formData.no_of_dependents} onChange={handleChange}/>
//         <SelectField label="Education" name="education" value={formData.education} onChange={handleChange} options={[{ value: "Graduate", label: "Graduate" },{ value: "Not Graduate", label: "Not Graduate" }]}/>
//         <SelectField label="Self Employed" name="self_employed" value={formData.self_employed} onChange={handleChange} options={[{ value: "Yes", label: "Yes" },{ value: "No", label: "No" }]}/>
//         <InputField label="Annual Income" name="income_annum" type="number" value={formData.income_annum} onChange={handleChange}/>
//         <InputField label="Loan Amount" name="loan_amount" type="number" value={formData.loan_amount} onChange={handleChange}/>
//         <InputField label="Loan Term (Months)" name="loan_term" type="number" value={formData.loan_term} onChange={handleChange}/>
//         <InputField label="CIBIL Score" name="cibil_score" type="number" value={formData.cibil_score} onChange={handleChange}/>
//         <InputField label="Residential Assets Value" name="residential_assets_value" type="number" value={formData.residential_assets_value} onChange={handleChange}/>
//         <InputField label="Commercial Assets Value" name="commercial_assets_value" type="number" value={formData.commercial_assets_value} onChange={handleChange}/>
//         <InputField label="Luxury Assets Value" name="luxury_assets_value" type="number" value={formData.luxury_assets_value} onChange={handleChange}/>
//         <InputField label="Bank Asset Value" name="bank_asset_value" type="number" value={formData.bank_asset_value} onChange={handleChange}/>

//         {/* === Submit Button === */}
//         <div className="md:col-span-2">
//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full py-3 rounded-lg font-semibold text-white transition-colors 
//                             ${
//                               loading
//                                 ? "bg-gray-600 cursor-not-allowed"
//                                 : "bg-indigo-600 hover:bg-indigo-700"
//                             }`}
//           >
//             {loading ? (
//               <div className="flex justify-center items-center space-x-2">
//                 <svg
//                   className="animate-spin h-5 w-5 text-white"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   ></circle>
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
//                   ></path>
//                 </svg>
//                 <span>Processing...</span>
//               </div>
//             ) : (
//               "Predict Loan Approval"
//             )}
//           </button>
//         </div>

//         {/* === Model Prediction === */}
//         {modelPrediction && (
//           <div className="md:col-span-2 text-center text-lg mt-6 font-medium border-t border-gray-600 pt-4">
//             <p>
//               Model Prediction:{" "}
//               <span
//                 className={
//                   modelPrediction === "Approved"
//                     ? "text-green-500"
//                     : "text-red-500"
//                 }
//               >
//                 {modelPrediction}
//               </span>
//             </p>
//             {modelReasons.length > 0 && (
//               <ul className="mt-3 list-disc list-inside text-left md:text-center space-y-1">
//                 {modelReasons.map((r, i) => (
//                   <li
//                     key={i}
//                     className="text-sm text-gray-300"
//                     dangerouslySetInnerHTML={{ __html: highlightReason(r) }}
//                   />
//                 ))}
//               </ul>
//             )}
//           </div>
//         )}

//         {/* === Final Decision === */}
//         {prediction && (
//           <div className="md:col-span-2 text-center text-lg mt-6 font-medium border-t border-gray-600 pt-4">
//             <div className="flex justify-center items-center space-x-2">
//               <p>
//                 Final Decision:{" "}
//                 <span
//                   className={
//                     prediction === "Approved"
//                       ? "text-green-500"
//                       : "text-red-500"
//                   }
//                 >
//                   {prediction}
//                 </span>
//               </p>
//               {/* ℹ️ Tooltip */}
//               <div className="relative group cursor-pointer">
//                 <span className="text-gray-400 hover:text-gray-200">ℹ️</span>
//                 <div className="absolute bottom-full mb-2 hidden group-hover:block w-56 bg-black text-white text-xs rounded-lg p-2 shadow-lg">
//                   Rule-based adjustments may override model output.
//                 </div>
//               </div>
//             </div>

//             {reasons.length > 0 && (
//               <ul className="mt-3 list-disc list-inside text-left md:text-center space-y-1">
//                 {reasons.map((r, i) => (
//                   <li
//                     key={i}
//                     className="text-sm text-gray-300"
//                     dangerouslySetInnerHTML={{ __html: highlightReason(r) }}
//                   />
//                 ))}
//               </ul>
//             )}
//           </div>
//         )}
//       </form>
//     </div>
//   );
// };

// export default PredictionForm;



import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; // Using context for auth check

// Replaced import.meta.env with a standard URL for compatibility
const API_URL = "http://localhost:5001/api";

// --- Styled Form Components for the Light Theme ---

const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">
      {label}
    </label>
    <input
      {...props}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-gray-300 focus:outline-none"
    />
  </div>
);

const SelectField = ({ label, options, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">
      {label}
    </label>
    <select
      {...props}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-gray-300 focus:outline-none"
    >
      <option value="">Select...</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

// --- Main Prediction Form Component ---

const PredictionForm = () => {
  const navigate = useNavigate();
  const { token } = useAuth(); // Get token from context

  const checkAuthAndProceed = (callback) => {
    if (token) {
      callback();
    } else {
      toast.info("Please log in to perform this action.");
      navigate("/login");
    }
  };

  const [formData, setFormData] = useState({
    no_of_dependents: "",
    education: "",
    self_employed: "",
    income_annum: "",
    loan_amount: "",
    loan_term: "",
    cibil_score: "",
    residential_assets_value: "",
    commercial_assets_value: "",
    luxury_assets_value: "",
    bank_asset_value: "",
  });

  const [prediction, setPrediction] = useState(null);
  const [reasons, setReasons] = useState([]);
  const [modelPrediction, setModelPrediction] = useState(null);
  const [modelReasons, setModelReasons] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Highlight keywords with a professional, bold style
  const highlightReason = (reason) => {
    const keywords = [
      "Loan-to-Income ratio", "CIBIL score", "Assets", "Annual income", "Strong financial profile",
    ];
    let highlighted = reason;
    keywords.forEach((word) => {
      const regex = new RegExp(`(${word})`, "gi");
      highlighted = highlighted.replace(regex, `<span class="font-bold text-gray-800">$1</span>`);
    });
    return highlighted;
  };

  // Save loan to backend (logic unchanged)
  const saveLoan = async (predictionResult) => {
    try {
      await axios.post(
        `${API_URL}/loan/apply`,
        {
          loan_amount: formData.loan_amount,
          income_annum: formData.income_annum,
          cibil_score: formData.cibil_score,
          status: predictionResult,
          created_at: new Date().toISOString(),
        },
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      toast.success("Loan record saved to dashboard!");
    } catch (error) {
      console.error("Failed to save loan:", error.response?.data || error.message);
      toast.error("Prediction done, but saving loan failed.");
    }
  };

  // Run prediction (logic unchanged)
  const runPrediction = async () => {
    const isValid = Object.values(formData).every(value => value !== "");
    if (!isValid) {
      toast.error("Please fill all fields before predicting.");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Getting your prediction...");
    try {
      const res = await axios.post(`${API_URL}/predict`, formData, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      setModelPrediction(res.data.model_prediction || null);
      setModelReasons(res.data.model_reasons || []);
      setPrediction(res.data.final_decision || null);
      setReasons(res.data.final_reasons || []);

      if (res.data.final_decision) {
        await saveLoan(res.data.final_decision);
      }

      toast.update(loadingToast, {
        render: res.data.final_reasons?.[0] || `Loan ${res.data.final_decision}!`,
        type: res.data.final_decision === "Approved" ? "success" : "error",
        isLoading: false,
        autoClose: 5000,
      });
    } catch (error) {
      const msg = error.response?.data?.error || "Could not connect to the prediction server.";
      toast.update(loadingToast, { render: msg, type: "error", isLoading: false, autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    checkAuthAndProceed(runPrediction);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">New Loan Prediction</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 shadow-sm rounded-lg p-8 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* --- Input Fields --- */}
        <InputField label="No of Dependents" name="no_of_dependents" type="number" value={formData.no_of_dependents} onChange={handleChange}/>
        <SelectField label="Education" name="education" value={formData.education} onChange={handleChange} options={[{ value: "Graduate", label: "Graduate" },{ value: "Not Graduate", label: "Not Graduate" }]}/>
        <SelectField label="Self Employed" name="self_employed" value={formData.self_employed} onChange={handleChange} options={[{ value: "Yes", label: "Yes" },{ value: "No", label: "No" }]}/>
        <InputField label="Annual Income" name="income_annum" type="number" value={formData.income_annum} onChange={handleChange}/>
        <InputField label="Loan Amount" name="loan_amount" type="number" value={formData.loan_amount} onChange={handleChange}/>
        <InputField label="Loan Term (Months)" name="loan_term" type="number" value={formData.loan_term} onChange={handleChange}/>
        <InputField label="CIBIL Score" name="cibil_score" type="number" value={formData.cibil_score} onChange={handleChange}/>
        <InputField label="Residential Assets Value" name="residential_assets_value" type="number" value={formData.residential_assets_value} onChange={handleChange}/>
        <InputField label="Commercial Assets Value" name="commercial_assets_value" type="number" value={formData.commercial_assets_value} onChange={handleChange}/>
        <InputField label="Luxury Assets Value" name="luxury_assets_value" type="number" value={formData.luxury_assets_value} onChange={handleChange}/>
        <InputField label="Bank Asset Value" name="bank_asset_value" type="number" value={formData.bank_asset_value} onChange={handleChange}/>

        {/* --- Submit Button --- */}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-800 hover:bg-gray-900"
            }`}
          >
            {loading ? (
              <div className="flex justify-center items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span>Processing...</span>
              </div>
            ) : "Predict Loan Approval"}
          </button>
        </div>

        {/* --- Prediction Results Section --- */}
        {(modelPrediction || prediction) && (
            <div className="md:col-span-2 space-y-6 mt-4 pt-6 border-t border-gray-200">
                {/* Model Prediction */}
                {modelPrediction && (
                    <div className="text-center">
                        <h3 className="font-semibold text-gray-700">Model Prediction</h3>
                        <p className={`text-lg font-bold ${modelPrediction === 'Approved' ? 'text-green-600' : 'text-red-600'}`}>
                            {modelPrediction}
                        </p>
                        {modelReasons.length > 0 && (
                            <ul className="mt-2 space-y-1 text-sm text-gray-500">
                                {modelReasons.map((r, i) => <li key={i} dangerouslySetInnerHTML={{ __html: highlightReason(r) }} />)}
                            </ul>
                        )}
                    </div>
                )}

                {/* Final Decision */}
                {prediction && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-gray-800 flex items-center justify-center gap-2">
                            Final Decision
                            <div className="relative group cursor-pointer">
                                <span className="text-gray-400 hover:text-gray-600">ℹ️</span>
                                <div className="absolute bottom-full mb-2 hidden group-hover:block w-56 bg-gray-700 text-white text-xs rounded-lg p-2 shadow-lg z-10">
                                    Rule-based adjustments may override the initial model output for accuracy.
                                </div>
                            </div>
                        </h3>
                        <p className={`text-xl font-bold ${prediction === 'Approved' ? 'text-green-600' : 'text-red-600'}`}>
                            {prediction}
                        </p>
                        {reasons.length > 0 && (
                             <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                {reasons.map((r, i) => <li key={i} dangerouslySetInnerHTML={{ __html: highlightReason(r) }} />)}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        )}
      </form>
    </div>
  );
};

export default PredictionForm;
