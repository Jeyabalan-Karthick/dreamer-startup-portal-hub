import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { supabase } from '../integrations/supabase/client';

const Reject: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No token provided.');
      return;
    }

    const supabaseUrl = (supabase as any).supabaseUrl || 'https://nxsrxdlsnabpshncdplv.supabase.co';
    const functionsUrl = `${supabaseUrl}/functions/v1/handle-approval?token=${token}`;

    fetch(functionsUrl)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.status === 'success') {
          setStatus('success');
          setCustomerEmail(data.application?.email || '');
          setMessage('Your message of rejection is sent to the customer ' + (data.application?.email || ''));
        } else {
          setStatus('error');
          setMessage(data.message || 'Unknown error');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Network error.');
      });
  }, [searchParams]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Application Rejection</DialogTitle>
        {status === 'loading' && <div>Processing rejection...</div>}
        {status !== 'loading' && (
          <>
            <div style={{ marginBottom: 16 }}>
              {status === 'success' ? '✅' : '❌'} {message}
            </div>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Reject; 