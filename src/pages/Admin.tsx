import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

interface Application {
  id: string;
  founder_name: string;
  startup_name: string;
  email: string;
  phone: string;
  company_type: string;
  team_size: string;
  incubation_centre: string;
  status: string;
  created_at: string;
  approved_at?: string;
  rejected_at?: string;
  website?: string;
  idea_description: string;
  expectations: string[];
  challenges?: string;
}

interface IncubationCentre {
  id: string;
  name: string;
  admin_email: string;
}

interface CouponCode {
  id: string;
  code: string;
  max_uses: number;
  expires_at: string;
  created_at: string;
  is_active: boolean;
}

interface CouponUsage {
  id: string;
  coupon_code_id: string;
  used_by_email: string;
  used_at: string;
}

const Admin = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [incubationCentres, setIncubationCentres] = useState<IncubationCentre[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCentre, setNewCentre] = useState({ name: '', admin_email: '' });
  const [activeTab, setActiveTab] = useState('all');
  const [couponCodes, setCouponCodes] = useState<CouponCode[]>([]);
  const [couponUsages, setCouponUsages] = useState<CouponUsage[]>([]);
  const [newCoupon, setNewCoupon] = useState({ 
    code: '', 
    max_uses: 1, 
    expires_at: '',
    is_active: true
  });
  const [couponLoading, setCouponLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
    fetchIncubationCentres();
    fetchCouponCodes();
    fetchCouponUsages();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        toast({
          title: "Error",
          description: "Failed to fetch applications",
          variant: "destructive",
        });
        return;
      }

      setApplications(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncubationCentres = async () => {
    try {
      const { data, error } = await supabase
        .from('incubation_centres')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching incubation centres:', error);
        return;
      }

      setIncubationCentres(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchCouponCodes = async () => {
    setCouponLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupon_codes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching coupon codes:', error);
        toast({
          title: "Error",
          description: "Failed to fetch coupon codes",
          variant: "destructive",
        });
        return;
      }
      
      setCouponCodes(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCouponLoading(false);
    }
  };

  const fetchCouponUsages = async () => {
    try {
      const { data, error } = await supabase
        .from('coupon_code_usages')
        .select('*')
        .order('used_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching coupon usages:', error);
        return;
      }
      
      setCouponUsages(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const addIncubationCentre = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCentre.name || !newCentre.admin_email) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('incubation_centres')
        .insert([newCentre]);

      if (error) {
        console.error('Error adding incubation centre:', error);
        toast({
          title: "Error",
          description: "Failed to add incubation centre",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Incubation centre added successfully",
      });

      setNewCentre({ name: '', admin_email: '' });
      fetchIncubationCentres();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const addCouponCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.max_uses || !newCoupon.expires_at) {
      toast({ 
        title: 'Error', 
        description: 'Please fill in all coupon fields', 
        variant: 'destructive' 
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('coupon_codes')
        .insert([{ 
          code: newCoupon.code.toUpperCase(),
          max_uses: newCoupon.max_uses,
          expires_at: newCoupon.expires_at,
          is_active: newCoupon.is_active
        }]);
      
      if (error) {
        console.error('Error adding coupon:', error);
        toast({ 
          title: 'Error', 
          description: 'Failed to add coupon code', 
          variant: 'destructive' 
        });
        return;
      }
      
      toast({ 
        title: 'Success', 
        description: 'Coupon code added successfully!' 
      });
      
      setNewCoupon({ code: '', max_uses: 1, expires_at: '', is_active: true });
      fetchCouponCodes();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('coupon_codes')
        .update({ is_active: !currentStatus })
        .eq('id', couponId);

      if (error) {
        console.error('Error updating coupon status:', error);
        toast({
          title: "Error",
          description: "Failed to update coupon status",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Coupon ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });

      fetchCouponCodes();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getFilteredApplications = () => {
    switch (activeTab) {
      case 'pending':
        return applications.filter(app => app.status === 'pending');
      case 'approved':
        return applications.filter(app => app.status === 'approved');
      case 'rejected':
        return applications.filter(app => app.status === 'rejected');
      default:
        return applications;
    }
  };

  const getStatusCounts = () => {
    return {
      all: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
    };
  };

  // Coupon analytics helpers
  const getCouponUsageCount = (couponId: string) =>
    couponUsages.filter(u => u.coupon_code_id === couponId).length;
    
  const getCouponStatus = (coupon: CouponCode) => {
    const used = getCouponUsageCount(coupon.id);
    const now = new Date();
    if (!coupon.is_active) return 'Inactive';
    if (new Date(coupon.expires_at) < now) return 'Expired';
    if (used >= coupon.max_uses) return 'Used Up';
    return 'Active';
  };
  
  const getCouponRemaining = (coupon: CouponCode) =>
    Math.max(0, coupon.max_uses - getCouponUsageCount(coupon.id));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();
  const filteredApplications = getFilteredApplications();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">View startup applications and manage incubation centers</p>
        </div>

        {/* Add New Incubation Centre */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Incubation Centre</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addIncubationCentre} className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="name">Centre Name</Label>
                <Input
                  id="name"
                  value={newCentre.name}
                  onChange={(e) => setNewCentre(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter incubation centre name"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="admin_email">Admin Email</Label>
                <Input
                  id="admin_email"
                  type="email"
                  value={newCentre.admin_email}
                  onChange={(e) => setNewCentre(prev => ({ ...prev, admin_email: e.target.value }))}
                  placeholder="Enter admin email"
                />
              </div>
              <Button type="submit">Add Centre</Button>
            </form>
          </CardContent>
        </Card>

        {/* Incubation Centres List */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Incubation Centres ({incubationCentres.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {incubationCentres.map((centre) => (
                <div key={centre.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900">{centre.name}</h3>
                  <p className="text-sm text-gray-600">{centre.admin_email}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Coupon Codes Management */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Coupon Codes Management</CardTitle>
            <p className="text-sm text-gray-600">Create and manage coupon codes for event registrations</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={addCouponCode} className="grid gap-4 md:grid-cols-5 items-end mb-6">
              <div>
                <Label htmlFor="coupon-code">Code</Label>
                <Input 
                  id="coupon-code" 
                  value={newCoupon.code} 
                  onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  placeholder="LEVELUP2025"
                />
              </div>
              <div>
                <Label htmlFor="coupon-max">Max Uses</Label>
                <Input 
                  id="coupon-max" 
                  type="number" 
                  min={1} 
                  value={newCoupon.max_uses} 
                  onChange={e => setNewCoupon({ ...newCoupon, max_uses: Number(e.target.value) })} 
                />
              </div>
              <div>
                <Label htmlFor="coupon-expiry">Expiry Date</Label>
                <Input 
                  id="coupon-expiry" 
                  type="date" 
                  value={newCoupon.expires_at} 
                  onChange={e => setNewCoupon({ ...newCoupon, expires_at: e.target.value })} 
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="coupon-active"
                  type="checkbox"
                  checked={newCoupon.is_active}
                  onChange={e => setNewCoupon({ ...newCoupon, is_active: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="coupon-active">Active</Label>
              </div>
              <Button type="submit" disabled={couponLoading}>
                {couponLoading ? 'Adding...' : 'Add Coupon'}
              </Button>
            </form>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Max Uses</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {couponCodes.map(coupon => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-mono">{coupon.code}</TableCell>
                      <TableCell>{coupon.max_uses}</TableCell>
                      <TableCell>{getCouponUsageCount(coupon.id)}</TableCell>
                      <TableCell>{getCouponRemaining(coupon)}</TableCell>
                      <TableCell>{format(new Date(coupon.expires_at), 'yyyy-MM-dd')}</TableCell>
                      <TableCell>
                        <Badge variant={
                          getCouponStatus(coupon) === 'Active' ? 'default' : 
                          getCouponStatus(coupon) === 'Expired' ? 'destructive' : 
                          'secondary'
                        }>
                          {getCouponStatus(coupon)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                        >
                          {coupon.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {couponCodes.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No coupon codes found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Applications View Only */}
        <Card>
          <CardHeader>
            <CardTitle>Applications Overview</CardTitle>
            <p className="text-sm text-gray-600">View-only dashboard for application status monitoring</p>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({statusCounts.approved})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({statusCounts.rejected})</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Founder</TableHead>
                        <TableHead>Startup</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Centre</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead>Action Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.founder_name}</TableCell>
                          <TableCell>{app.startup_name}</TableCell>
                          <TableCell>{app.email}</TableCell>
                          <TableCell>{app.phone}</TableCell>
                          <TableCell>{app.incubation_centre}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(app.status)}>
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(app.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {app.status === 'approved' && app.approved_at && (
                              <span className="text-sm text-green-600">
                                ✅ {new Date(app.approved_at).toLocaleDateString()}
                              </span>
                            )}
                            {app.status === 'rejected' && app.rejected_at && (
                              <span className="text-sm text-red-600">
                                ❌ {new Date(app.rejected_at).toLocaleDateString()}
                              </span>
                            )}
                            {app.status === 'pending' && (
                              <span className="text-sm text-gray-500">
                                ⏳ Awaiting review
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredApplications.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No applications found for this filter</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
