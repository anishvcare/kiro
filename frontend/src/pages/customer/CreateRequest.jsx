import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import RequestForm from '../../components/request/RequestForm';
import { createRequest, uploadRequestImages, clearCreateSuccess } from '../../store/slices/requestSlice';

const CreateRequest = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { shopId } = useParams();
  const { isLoading, error, createSuccess } = useSelector((state) => state.request);

  useEffect(() => {
    if (createSuccess) {
      dispatch(clearCreateSuccess());
      navigate('/customer/requests');
    }
  }, [createSuccess, dispatch, navigate]);

  const handleSubmit = async (formData) => {
    const { images, ...requestData } = formData;

    // Create the request first
    const result = await dispatch(createRequest(requestData));

    if (result.meta.requestStatus === 'fulfilled' && images && images.length > 0) {
      // Upload images if request was created successfully
      const imageFormData = new FormData();
      images.forEach((img) => imageFormData.append('images', img));

      await dispatch(uploadRequestImages({
        requestId: result.payload.id,
        formData: imageFormData,
      }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Request</h1>
        <p className="text-gray-600 mb-6">
          Describe what you need and we will send your request to the shop.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <RequestForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          shopId={shopId}
        />
      </div>
    </div>
  );
};

export default CreateRequest;
