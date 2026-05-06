"use client";

export default function Popup({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
        <h3 className="text-xl font-medium text-text2 mb-8 leading-snug">
          Xác nhận thông tin khách hàng<br/>khớp với yêu cầu chính sách ?
        </h3>
        <div className="flex justify-center gap-6">
          <button 
            onClick={onConfirm}
            className="bg-text2 text-white px-8 py-2 rounded-xl text-lg font-medium hover:bg-text1 transition shadow-md"
          >
            Có
          </button>
          <button 
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-8 py-2 rounded-xl text-lg font-medium hover:bg-gray-400 transition shadow-md"
          >
            Không
          </button>
        </div>
      </div>
    </div>
  );
}