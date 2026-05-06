import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, UserCheck, Clock, Award, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface Worker {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  profilePhoto?: string;
  createdAt?: string;
}

const ProductionPage = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Worker>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: "",
    email: "",
    role: "productionworker",
    password: "",
  });

  // ✅ Fetch production workers
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");

        if (!token) {
          setError("Authentication token not found. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${BASE_URL}/admin/get-production-workers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const fetchedWorkers = response.data?.data || [];
        if (Array.isArray(fetchedWorkers)) {
          const validWorkers = fetchedWorkers.filter((w) => w && w.name);
          setWorkers(validWorkers);
        } else {
          setError("Unexpected data format from server.");
        }
      } catch (err: any) {
        console.error("Error fetching workers:", err);
        setError("Server error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "W";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // ✅ Handle Edit Worker
  const handleEditClick = (worker: Worker) => {
    setSelectedWorker(worker);
    setEditForm(worker);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!selectedWorker || !selectedWorker._id) return;
      const token = localStorage.getItem("authToken");

      const response = await axios.put(
        `${BASE_URL}/admin/updateWorker/${selectedWorker._id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setWorkers((prev) =>
          prev.map((w) =>
            w._id === selectedWorker._id ? { ...w, ...editForm } : w
          )
        );
        setIsDialogOpen(false);
      } else {
        alert("Failed to update worker details");
      }
    } catch (error) {
      console.error("Error updating worker:", error);
      alert("Error saving worker data");
    }
  };

  // ✅ Handle Add Worker
  const handleAddWorker = async () => {
    if (!newWorker.name || !newWorker.email || !newWorker.password) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${BASE_URL}/auth/worker/register`,
        newWorker,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const added = response.data?.data;
      if (response.data.success && added && added.name) {
        setWorkers((prev) => [...prev, added]);
        setIsAddDialogOpen(false);
        setNewWorker({
          name: "",
          email: "",
          role: "productionworker",
          password: "",
        });
      setWorkers((prev) => [...prev, added]);
      } else {
        alert(response.data.message || "Failed to add worker.");
      }
    } catch (error: any) {
      console.error("Error adding worker:", error);
      alert(error.response?.data?.message || "Server error.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-foreground mb-1">
            Production Workers
          </h3>
          <p className="text-muted-foreground">
            Monitor workforce status and edit worker details.
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Worker
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workers?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Across factory</p>
          </CardContent>
        </Card>
      </div>

      {/* Error and Loading */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {loading && <p className="text-muted-foreground">Loading workers...</p>}

      {/* Worker Cards */}
      {!loading && !error && workers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workers
            .filter((w) => w && w.name)
            .map((worker) => (
              <Card
                key={worker._id}
                className="hover:shadow-md transition-shadow relative"
              >
                <CardHeader className="flex flex-row items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(worker.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{worker.name}</CardTitle>
                    <CardDescription>{worker.email}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    <strong>Role:</strong> {worker.role}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Joined:{" "}
                    {worker.createdAt
                      ? new Date(worker.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </CardContent>
                <div className="absolute bottom-3 right-3">
                  <Button size="sm" onClick={() => handleEditClick(worker)}>
                    Edit
                  </Button>
                </div>
              </Card>
            ))}
        </div>
      ) : (
        !loading &&
        !error && (
          <p className="text-muted-foreground text-center">No workers found.</p>
        )
      )}

      {/* Add Worker Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Worker</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Name</Label>
              <Input
                placeholder="Enter name"
                value={newWorker.name}
                onChange={(e) =>
                  setNewWorker({ ...newWorker, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                placeholder="Enter email"
                value={newWorker.email}
                onChange={(e) =>
                  setNewWorker({ ...newWorker, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Enter password"
                value={newWorker.password}
                onChange={(e) =>
                  setNewWorker({ ...newWorker, password: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="secondary"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddWorker}>Add Worker</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductionPage;
