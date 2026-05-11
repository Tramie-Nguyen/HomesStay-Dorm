"use client";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing?: boolean;
}

export default function ConfirmPopup({ open, onClose, onConfirm, isProcessing }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 w-[380px] shadow-2xl border-[3px] border-text1">
        
        <p className="text-center text-text2 text-[17px] font-medium mb-8 leading-snug">
          Xác nhận thông tin khách hàng <br /> khớp với yêu cầu chính sách ?
        </p>
        
        <div className="flex justify-center gap-10">
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="bg-text2 hover:bg-[#2f6a7a] text-white font-medium py-2 w-24 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            Có
          </button>
          
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="bg-text2 hover:bg-[#2f6a7a] text-white font-medium py-2 w-24 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            Không
          </button>
        </div>

      </div>
    </div>
  );
}