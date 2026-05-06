import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Boxes, TrendingUp, Package, Truck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface Product {
  _id: string;
  name: string;
  quantity: number;
}

interface Shipment {
  _id: string;
  product: string;
  quantity: number;
  destination: string;
  status: string;
  date: string;
}

const FinishedGoodsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Fetch finished goods and shipments
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");

        if (!token) {
          setError("Authentication token not found. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${BASE_URL}/admin/get-all-products`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          setProducts(response.data.data);
          setFilteredProducts(response.data.data);
          setError("");
        } else {
          setError(response.data.message || "Failed to fetch finished goods.");
        }
      } catch (err: any) {
        console.error("Error fetching products:", err);
        if (err.response?.status === 401) {
          setError("Unauthorized. Please log in again.");
        } else {
          setError("Server error. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchShipments = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const response = await axios.get(
          `${BASE_URL}/store/Product/getShipments`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          setShipments(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching shipments:", err);
      }
    };

    fetchProducts();
    fetchShipments();
  }, []);

  // ✅ Dashboard summary stats
  const totalProducts = filteredProducts.length;
  const totalQuantity = filteredProducts.reduce(
    (sum, p) => sum + (p.quantity || 0),
    0
  );
  const activeShipments = shipments.filter(
    (s) => s.status !== "Delivered"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Finished Goods Management
        </h3>
        <p className="text-muted-foreground">
          Track completed products, inventory levels, and shipment status
        </p>
      </div>

      {/* Error or Loading */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {loading && <p className="text-muted-foreground">Loading products...</p>}

      {!loading && !error && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Products
                </CardTitle>
                <Boxes className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <p className="text-xs text-muted-foreground">Items listed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Quantity
                </CardTitle>
                <Package className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalQuantity}</div>
                <p className="text-xs text-muted-foreground">Units available</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Shipments
                </CardTitle>
                <Truck className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeShipments}</div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12%</div>
                <p className="text-xs text-muted-foreground">
                  Production increase
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Product Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Product Inventory</CardTitle>
              <CardDescription>Current stock of finished goods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">
                        Product Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        Quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr
                        key={product._id}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium">{product.name}</td>
                        <td className="py-3 px-4">{product.quantity} units</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Shipments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Shipments</CardTitle>
              <CardDescription>Track outgoing product deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shipments.length > 0 ? (
                  shipments.map((shipment) => (
                    <div
                      key={shipment._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{shipment.product}</p>
                        <p className="text-sm text-muted-foreground">
                          {shipment.quantity} units → {shipment.destination}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {shipment.status}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(shipment.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No recent shipments found.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default FinishedGoodsPage;
