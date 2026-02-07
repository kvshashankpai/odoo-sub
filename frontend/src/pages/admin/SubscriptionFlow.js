import React, { useState } from 'react';

function SubscriptionFlow() {
  const [step, setStep] = useState(1);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Subscription Flow</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>1</div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>2</div>
            <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>3</div>
          </div>
        </div>

        {step === 1 && <div>Step 1: Select Plan</div>}
        {step === 2 && <div>Step 2: Configure</div>}
        {step === 3 && <div>Step 3: Review & Confirm</div>}

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            disabled={step === 1}
          >
            Previous
          </button>
          <button
            onClick={() => setStep(Math.min(3, step + 1))}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
            disabled={step === 3}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionFlow;
