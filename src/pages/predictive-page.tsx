import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Activity, Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_ENDPOINT = "https://fhjz38dx-5001.inc1.devtunnels.ms/predict";

const PRODUCTS = [
  "MINI AUTO",
  "DOL PLASTIC",
  "DOL METAL",
  "1PH",
  "2PH",
  "SEMI AUTO",
  "V3 DRY RUN AUTO 1PH",
  "V3 DRY RUN AUTO 2PH",
  "V3 DRY RUN AUTO 3PH",
  "V3 2/3 PH TOUCH AUTO",
  "SERIES AUTO",
  "V3 2 PH JUICE AUTO",
  "MOBILE AUTO 3G",
  "MO AUTO 4G",
] as const;

interface APIPastRec { month: string; actual: number }
interface APIForecastRec { month: string; forecast: number }
interface APIResponse {
  product: string
  past_3_months: APIPastRec[]
  forecast_3_months: APIForecastRec[]
  told_form: string
}

interface ChartRow {
  month: string
  actual?: number
  forecast?: number
}

const PredictivePage: React.FC = () => {
  const [product, setProduct] = useState<(typeof PRODUCTS)[number]>("MINI AUTO");
  const [months, setMonths] = useState<number>(3);
  const [data, setData] = useState<ChartRow[] | null>(null);
  const [raw, setRaw] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, months }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API ${res.status}: ${text}`);
      }
      const json: APIResponse = await res.json();
      setRaw(json);
      const chartData: ChartRow[] = json.forecast_3_months.map((r) => ({
        month: r.month,
        forecast: r.forecast,
      }));
      setData(chartData);
    } catch (e: any) {
      setError(e.message || "Failed to fetch forecast");
      setData(null);
      setRaw(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  const monthsOptions = useMemo(() => Array.from({ length: 10 }, (_, i) => i + 3), []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-foreground mb-2">AI-Powered Predictions</h3>
        <p className="text-muted-foreground">
          Advanced analytics and machine learning predictions for production optimization
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Forecast Controls</CardTitle>
          <CardDescription>Select a product and forecast horizon (3–12 months)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-end">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={product} onValueChange={(v) => setProduct(v as (typeof PRODUCTS)[number])}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {PRODUCTS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Months</Label>
              <Select value={String(months)} onValueChange={(v) => setMonths(parseInt(v))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Months" />
                </SelectTrigger>
                <SelectContent>
                  {monthsOptions.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="opacity-0">Refresh</Label>
              <Button onClick={fetchForecast} disabled={loading} className="w-full">
                {loading ? (
                  <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading</span>
                ) : (
                  "Run Forecast"
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Forecast</CardTitle>
          <CardDescription>
            Product: <span className="font-medium">{product}</span> · Horizon: <span className="font-medium">{months} months</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="forecast" name="Forecast" strokeDasharray="5 5" dot />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {!loading && !data && !error && (
            <div className="text-sm text-muted-foreground mt-2">No data yet. Choose options and click Run Forecast.</div>
          )}
        </CardContent>
      </Card>

      {raw && (
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Upcoming forecast</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {raw.forecast_3_months.map((rec) => (
                <div key={`f-${rec.month}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5" />
                    <span className="font-medium">{rec.month}</span>
                  </div>
                  <span className="text-sm">Forecast: <strong>{rec.forecast}</strong></span>
                </div>
              ))}
            </div>
            {/* <div className="mt-6">
              <Label>Terse summary</Label>
              <pre className="mt-2 whitespace-pre-wrap rounded-md border bg-muted p-3 text-sm">{raw.told_form}</pre>
            </div> */}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PredictivePage;
