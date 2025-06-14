
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  website?: string;
  idea_description: string;
}

interface IncubationCentre {
  id: string;
  name: string;
  admin_email: string;
}

const Admin = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [incubationCentres, setIncubationCentres] = useState<IncubationCentre[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCentre, setNewCentre] = useState({ name: '', admin_email: '' });

  useEffect(() => {
    fetchApplications();
    fetchIncubationCentres();
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

  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Error updating status:', error);
        toast({
          title: "Error",
          description: "Failed to update application status",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Application status updated",
      });

      fetchApplications();
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage startup applications and incubation centers</p>
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

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Applications ({applications.length})</CardTitle>
          </CardHeader>
          <CardContent>
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
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
                        <div className="flex gap-2">
                          {app.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateApplicationStatus(app.id, 'approved')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateApplicationStatus(app.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {applications.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No applications found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
