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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Application Rejection</DialogTitle>
        <div style={{ marginBottom: 16 }}>
          ❌ Application rejection notification has been sent to the user.
        </div>
        <Button onClick={() => setOpen(false)}>Close</Button>
      </DialogContent>
    </Dialog>
  );
};

export default Reject; 