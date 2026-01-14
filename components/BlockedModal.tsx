import React from 'react';
import { Button } from './Button';
import { Lock } from 'lucide-react';

interface BlockedModalProps {
  message?: string;
  onClose: () => void;
}

export const BlockedModal: React.FC<BlockedModalProps> = ({ message, onClose }) => {
  return (
    <div className="space-y-6 text-center">
      <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-2">
        <Lock size={32} />
      </div>
      
      <p className="text-gray-700 text-lg">
        {message || "Your account has been restricted. Please contact administration."}
      </p>

      <div className="pt-2">
        <Button variant="secondary" onClick={onClose} fullWidth>
          OK
        </Button>
      </div>
    </div>
  );
};
