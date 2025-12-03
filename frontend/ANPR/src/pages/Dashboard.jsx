import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Server, CheckCircle, XCircle, Target, Clock, TrendingUp, AlertTriangle, Eye, Zap } from 'lucide-react';
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import ThemeToggle from '@/components/ThemeToggle';

// OCR Mode Toggle Component
function OCRModeToggle() {
  const [ocrMode, setOcrMode] = useState('local');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/ocr-mode')
      .then(res => res.json())
      .then(data => setOcrMode(data.ocr_mode || 'local'));
  }, []);

  const switchMode = async () => {
    setLoading(true);
    const newMode = ocrMode === 'local' ? 'roboflow' : 'local';
    const res = await fetch('http://localhost:8000/api/v1/ocr-mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ocr_mode: newMode })
    });
    const data = await res.json();
    setOcrMode(data.ocr_mode);
    setLoading(false);
    toast.success(`Switched to ${data.ocr_mode === 'roboflow' ? 'Roboflow OCR' : 'Local OCR'}`);
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="font-medium">OCR Mode:</span>
      <Button onClick={switchMode} disabled={loading} variant="outline">
        {ocrMode === 'roboflow' ? 'Roboflow OCR' : 'Local OCR'}
      </Button>
    </div>
  );
}

const Dashboard = () => {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [stats, setStats] = useState({
    totalInferences: 0,
    avgConfidence: 0,
    ocrFailureRate: 0,
    avgProcessingTime: 0
  });
  const [recentDetections, setRecentDetections] = useState([]);

  // Sample data for charts
  const dailyInferenceData = [
    { day: 'Mon', inferences: 45 },
    { day: 'Tue', inferences: 52 },
    { day: 'Wed', inferences: 38 },
    { day: 'Thu', inferences: 67 },
    { day: 'Fri', inferences: 89 },
    { day: 'Sat', inferences: 34 },
    { day: 'Sun', inferences: 23 }
  ];

  const confidenceDistributionData = [
    { range: '90-100%', count: 45 },
    { range: '80-89%', count: 32 },
    { range: '70-79%', count: 28 },
    { range: '60-69%', count: 15 },
    { range: '50-59%', count: 8 },
    { range: '<50%', count: 3 }
  ];

  const processingTimeData = [
    { time: '00:00', avgTime: 120 },
    { time: '04:00', avgTime: 95 },
    { time: '08:00', avgTime: 150 },
    { time: '12:00', avgTime: 180 },
    { time: '16:00', avgTime: 140 },
    { time: '20:00', avgTime: 110 }
  ];

  const modelPerformanceData = [
    { model: 'License Plate Detection', accuracy: 94, speed: 'Fast' },
    { model: 'Character Recognition', accuracy: 87, speed: 'Medium' },
    { model: 'Vehicle Tracking', accuracy: 91, speed: 'Fast' }
  ];

  const checkBackendHealth = async () => {
    try {
      const response = await fetch('http://localhost:8000/');
      if (response.ok) {
        setBackendStatus('online');
        toast.success("Backend is online and ready");
      } else {
        setBackendStatus('offline');
      }
    } catch (error) {
      setBackendStatus('offline');
      console.error('Backend health check failed:', error);
    }
  };

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);



  useEffect(() => {
    fetch('http://localhost:8000/api/v1/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {
        // Fallback to sample data if backend is not available
        setStats({
          totalInferences: 1234,
          avgConfidence: 87,
          ocrFailureRate: 12,
          avgProcessingTime: 145
        });
      });
    fetch('http://localhost:8000/api/v1/recent-detections')
      .then(res => res.json())
      .then(data => setRecentDetections(data))
      .catch(() => {
        // Fallback to sample data if backend is not available
        setRecentDetections([
          { plate: 'ABC123', confidence: 94, status: 'Success', timestamp: '2024-01-15 14:30:22' },
          { plate: 'XYZ789', confidence: 87, status: 'Success', timestamp: '2024-01-15 14:28:15' },
          { plate: 'DEF456', confidence: 72, status: 'Success', timestamp: '2024-01-15 14:25:43' },
          { plate: 'GHI789', confidence: 45, status: 'Failed', timestamp: '2024-01-15 14:22:18' },
          { plate: 'JKL012', confidence: 91, status: 'Success', timestamp: '2024-01-15 14:20:05' }
        ]);
      });
  }, []);

  const getStatusIcon = () => {
    switch (backendStatus) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-primary" />;
      case 'offline':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground animate-pulse" />;
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'online':
        return 'Backend Online';
      case 'offline':
        return 'Backend Offline';
      default:
        return 'Checking...';
    }
  };

  return (
    <div className="min-h-screen w-full bg-graph-paper dark:bg-graph-paper-dark flex flex-col items-center py-8 px-2 font-sparrow">
      <nav className="w-full flex justify-end pr-8 mb-4">
        <ThemeToggle />
      </nav>
      <OCRModeToggle />
      <Card className="backdrop-blur-xl bg-white/60 dark:bg-[#232526]/60 border border-white/30 dark:border-[#444]/30 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] p-6 mb-8 w-full max-w-4xl transition font-sparrow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-sparrow">
            <Server className="h-5 w-5 text-muted-foreground" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-medium text-foreground font-sparrow">{getStatusText()}</span>
            </div>
            <Button 
              variant="outline" 
              className="backdrop-blur bg-white/60 dark:bg-[#232526]/60 text-foreground rounded-lg hover:bg-white/80 dark:hover:bg-[#232526]/80 border border-white/30 dark:border-[#444]/30 font-sparrow shadow-[0_2px_12px_0_rgba(31,38,135,0.10)]"
              onClick={checkBackendHealth}
              disabled={backendStatus === 'checking'}
            >
              Refresh Status
            </Button>
          </div>
          {backendStatus === 'offline' && (
            <div className="mt-3 p-3 bg-destructive/10 dark:bg-destructive/20 rounded text-destructive font-sparrow">
              <p className="text-sm">Backend is not responding. Make sure the FastAPI server is running on http://localhost:8000</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl">
        <Card className="backdrop-blur-xl bg-white/60 dark:bg-[#232526]/60 border border-white/30 dark:border-[#444]/30 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] p-6 transition font-sparrow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-sparrow">Total Inferences</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground font-sparrow">{stats.totalInferences.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground font-sparrow">Images & videos processed</p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/60 dark:bg-[#232526]/60 border border-white/30 dark:border-[#444]/30 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] p-6 transition font-sparrow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 font-sparrow">Avg Confidence</CardTitle>
            <Target className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground font-sparrow">{stats.avgConfidence}%</div>
            <p className="text-xs text-gray-500 font-sparrow">Model accuracy score</p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/60 dark:bg-[#232526]/60 border border-white/30 dark:border-[#444]/30 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] p-6 transition font-sparrow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 font-sparrow">OCR Failure Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground font-sparrow">{stats.ocrFailureRate}%</div>
            <p className="text-xs text-gray-500 font-sparrow">Character recognition fails</p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/60 dark:bg-[#232526]/60 border border-white/30 dark:border-[#444]/30 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] p-6 transition font-sparrow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 font-sparrow">Avg Processing</CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground font-sparrow">{stats.avgProcessingTime}ms</div>
            <p className="text-xs text-gray-500 font-sparrow">Response time per request</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl mt-8">
        <Card className="backdrop-blur-xl bg-white/60 dark:bg-[#232526]/60 border border-white/30 dark:border-[#444]/30 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] p-6 transition font-sparrow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white font-sparrow">
              <TrendingUp className="h-5 w-5 text-gray-300" />
              Daily Inference Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyInferenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#aaa" fontSize={12} />
                <YAxis stroke="#aaa" fontSize={12} />
                <Tooltip contentStyle={{ background: '#232526', color: '#fff', borderRadius: '0.75rem', border: 'none', fontSize: 14 }} />
                <Bar dataKey="inferences" fill="url(#bar-gradient)" radius={4} />
                <defs>
                  <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#166534" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/60 dark:bg-[#232526]/60 border border-white/30 dark:border-[#444]/30 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] p-6 transition font-sparrow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white font-sparrow">
              <Target className="h-5 w-5 text-gray-300" />
              Confidence Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={confidenceDistributionData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" stroke="#aaa" fontSize={12} />
                <YAxis dataKey="range" type="category" width={120} stroke="#aaa" fontSize={12} />
                <Tooltip contentStyle={{ background: '#232526', color: '#fff', borderRadius: '0.75rem', border: 'none', fontSize: 14 }} />
                <Bar dataKey="count" fill="#6366f1" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/60 dark:bg-[#232526]/60 border border-white/30 dark:border-[#444]/30 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] p-6 transition font-sparrow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white font-sparrow">
              <Zap className="h-5 w-5 text-gray-300" />
              Model Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-400 font-sparrow">
              {modelPerformanceData.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>{item.model}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.accuracy}%</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.speed === 'Fast' ? 'bg-green-400/10 text-green-400 border border-green-400/20' :
                      item.speed === 'Medium' ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20' :
                      'bg-red-400/10 text-red-400 border border-red-400/20'
                    }`}>
                      {item.speed}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/60 dark:bg-[#232526]/60 border border-white/30 dark:border-[#444]/30 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] p-6 transition font-sparrow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white font-sparrow">
              <Clock className="h-5 w-5 text-gray-300" />
              Processing Time Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={processingTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#aaa" fontSize={12} />
                <YAxis stroke="#aaa" fontSize={12} />
                <Tooltip contentStyle={{ background: '#232526', color: '#fff', borderRadius: '0.75rem', border: 'none', fontSize: 14 }} />
                <Line 
                  type="monotone" 
                  dataKey="avgTime" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Detections Table */}
      <Card className="backdrop-blur-xl bg-white/60 dark:bg-[#232526]/60 border border-white/30 dark:border-[#444]/30 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] p-6 transition w-full max-w-4xl mt-8 font-sparrow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white font-sparrow">
            <Activity className="h-5 w-5 text-gray-300" />
            Recent Detections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-gray-900 dark:text-white">
              <thead>
                <tr className="border-b border-[#333]">
                  <th className="text-left p-2 font-medium font-sparrow">License Plate</th>
                  <th className="text-left p-2 font-medium font-sparrow">Confidence</th>
                  <th className="text-left p-2 font-medium font-sparrow">Status</th>
                  <th className="text-left p-2 font-medium font-sparrow">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {recentDetections.map((detection, idx) => (
                  <tr key={idx} className="border-b border-[#232526]">
                    <td className="p-2 font-mono font-sparrow">{detection.plate}</td>
                    <td className="p-2 font-sparrow">
                      <span className={`font-medium ${
                        detection.confidence > 90 ? 'text-green-400' :
                        detection.confidence > 75 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {detection.confidence}%
                      </span>
                    </td>
                    <td className="p-2 font-sparrow">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        detection.status === 'Success' 
                          ? 'bg-green-400/10 text-green-400 border border-green-400/20' 
                          : 'bg-red-400/10 text-red-400 border border-red-400/20'
                      }`}>
                        {detection.status}
                      </span>
                    </td>
                    <td className="p-2 text-gray-500 text-sm font-sparrow">{detection.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-xl bg-white/60 dark:bg-[#232526]/60 border border-white/30 dark:border-[#444]/30 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] p-6 transition w-full max-w-4xl mt-8 font-sparrow">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white font-sparrow">System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400 font-sparrow">
            <div>
              <h4 className="font-medium mb-2 font-sparrow">Backend Endpoints</h4>
              <ul className="space-y-1 font-sparrow">
                <li>Health Check: GET /</li>
                <li>Image Processing: POST /api/v1/process-image</li>
                <li>Video Processing: POST /api/v1/process-video</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 font-sparrow">Models Used</h4>
              <ul className="space-y-1 font-sparrow">
                <li>License Plate Detector (YOLO)</li>
                <li>Character Recognition (OCR)</li>
                <li>Vehicle Tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 font-sparrow">Supported Formats</h4>
              <ul className="space-y-1 font-sparrow">
                <li>Images: JPG, PNG, BMP</li>
                <li>Videos: MP4, AVI, MOV</li>
                <li>Output: JSON with coordinates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;