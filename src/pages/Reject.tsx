import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { supabase } from '../integrations/supabase/client';

const Reject: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) return;
    const supabaseUrl = (supabase as any).supabaseUrl || 'https://nxsrxdlsnabpshncdplv.supabase.co';
    const functionsUrl = `${supabaseUrl}/functions/v1/handle-approval?token=${token}`;
    fetch(functionsUrl).catch(() => {});
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-gray-200 dark:border-gray-700 dark:bg-gray-800">
          <DialogTitle className="text-gray-900 dark:text-white">Application Rejection</DialogTitle>
          <div className="mb-4 text-gray-600 dark:text-gray-300">
            ❌ Application rejection notification has been sent to the user.
          </div>
          <Button 
            onClick={() => setOpen(false)}
            className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold transition-colors duration-200"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reject; 