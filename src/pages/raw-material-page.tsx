import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Package, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface RawMaterial {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  supplier: string;
  category: string; // ✅ ADDED
}

const categories = [
  "Virat Fuse","Contactor","Connector","Convertor Relay (Red Relay)",
  "Mobile Auto","MK1 Relay (Black)","MK2 Relay (DMC)","MU Relay",
  "Virat Capacitor","Shubh Capacitor","Epcos Capacitor","Box Capacitor",
  "Oil Capacitor","Coil","MCB","Base","8 MM Dol Starter","10 MM Dol Starter",
  "MU DMC Starter","Patti Kit","Switch","Meter","Transformer","Wire",
  "Wire Connector","Ready Wire Set","Blank PCB","Assemble PCB",
  "Metal Body","Screw","Outer Box","Electronic Components","Ready Auto","Ready Panel"
];

const units = ["PCS", "BOX", "MTR", "SET", "CHART"];

const RawMaterialPage = () => {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedUnit, setSelectedUnit] = useState("ALL");

  // ✅ Fetch data
  useEffect(() => {
    const fetchRawMaterials = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");

        const response = await axios.get(
          `${BASE_URL}/admin/get-all-raw-material`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          setRawMaterials(response.data.data);
          setFilteredMaterials(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err: any) {
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchRawMaterials();
  }, []);

  // ✅ FILTER LOGIC (Search + Category + Unit)
  useEffect(() => {
    const filtered = rawMaterials.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "ALL" || item.category === selectedCategory;

      const matchesUnit =
        selectedUnit === "ALL" || item.unit === selectedUnit;

      return matchesSearch && matchesCategory && matchesUnit;
    });

    setFilteredMaterials(filtered);
  }, [searchTerm, selectedCategory, selectedUnit, rawMaterials]);

  // ✅ Status Logic
  const getStatus = (item: RawMaterial) => {
    if (item.quantity <= 0) return "Out of Stock";
    if (item.quantity <= item.reorderLevel / 2) return "Critical";
    if (item.quantity <= item.reorderLevel) return "Low Stock";
    return "In Stock";
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      "In Stock": "bg-green-100 text-green-800",
      "Low Stock": "bg-yellow-100 text-yellow-800",
      Critical: "bg-red-100 text-red-800",
      "Out of Stock": "bg-gray-100 text-gray-800",
    };

    return <Badge className={styles[status as keyof typeof styles]}>{status}</Badge>;
  };

  // Stats
  const totalItems = rawMaterials.length;
  const lowStockCount = rawMaterials.filter(
    (item) => item.quantity <= item.reorderLevel
  ).length;
  const healthyStock = totalItems - lowStockCount;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h3 className="text-lg font-medium">Raw Material Inventory</h3>
        <p className="text-muted-foreground">
          Monitor and manage raw material stock
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border px-3 py-2 rounded-md text-sm"
        >
          <option value="ALL">All Categories</option>
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        {/* Unit Filter */}
        <select
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value)}
          className="border px-3 py-2 rounded-md text-sm"
        >
          <option value="ALL">All Units</option>
          {units.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading */}
      {loading && <p>Loading...</p>}

      {!loading && !error && (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Items</CardTitle>
              </CardHeader>
              <CardContent>{totalItems}</CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Low Stock</CardTitle>
              </CardHeader>
              <CardContent>{lowStockCount}</CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Healthy</CardTitle>
              </CardHeader>
              <CardContent>{healthyStock}</CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
              <CardDescription>Live stock data</CardDescription>
            </CardHeader>

            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left">Material</th>
                    <th className="py-3 px-4 text-left">Category</th>
                    <th className="py-3 px-4 text-left">Quantity</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Unit</th> {/* renamed */}
                    <th className="py-3 px-4 text-left">Supplier</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMaterials.map((item) => {
                    const status = getStatus(item);
                    return (
                      <tr key={item._id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="py-3 px-4">{item.category}</td>
                        <td className="py-3 px-4">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(status)}
                        </td>
                        <td className="py-3 px-4">
                          {item.unit} {/* changed */}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {item.supplier || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default RawMaterialPage;