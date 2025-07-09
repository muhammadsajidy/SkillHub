import { useEffect, useState } from "react";
import axios from "../axios/axiosInstance";
import {
  Box,
  Card,
  CircularProgress,
  Container,
  Typography
} from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, PieChart, Pie, Sector, Cell, } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Reports() {
  const [departmentWise, setDepartmentWise] = useState([]);
  const [skillLevelWise, setSkillLevelWise] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDepartmentWise();
    fetchSkillLevelWise();
    fetchTopPerformers();
  }, []);

  const fetchDepartmentWise = async () => {
    try {
      const { data } = await axios.get("/analytics/department-wise");
      const parsed = data.map(d => ({
        ...d,
        average_score: Number(d.average_score)    
      }));
      setDepartmentWise(parsed);
    } catch (e) {
      setError("Could not load department analytics.");
    } finally {
      setLoading(false);
    };
  };

  const fetchTopPerformers = async () => {
    await axios.get("/analytics/top-performers")
    .then((res) => setTopPerformers(res.data))
    .catch(() => setError("Could not load department analytics."))
    .finally(() => setLoading(false));
  };

  const fetchSkillLevelWise = async () => {
    await axios.get("/analytics/skilllevel-wise")
    .then((res) => {
    const raw = res.data;
    const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const transformed = skillLevels.map(level => {
        const match = raw.find(item => item.skill_level === level);
        return {
          name: level,
          value: match ? Number(match.count) : 0
        };
    });
    setSkillLevelWise(transformed);
    })
    .catch(() => setError("Could not load department analytics."))
    .finally(() => setLoading(false));
  };

  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{ width: "100%", display: "flex", flexDirection: "column" }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">Reports</Typography>
          <Typography sx={{ color: "#64748b" }}>Analytics and insights on skill development and performance</Typography>
        </Box>
      </Box>

      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mt: 3
        }}
      >
        <Card variant="outlined" sx={{ width: { sm: "100%", lg: "49%" }, p: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography mb={4} width="100%" fontWeight={600} fontSize={22}>Average Skill Level by Department</Typography>
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentWise}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dept_name" />
                <YAxis domain={[0, 10]} ticks={[2.5, 5, 7.5, 10]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="average_score" fill="black" barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card
        variant="outlined"
        sx={{ width: { sm: "100%", lg: "49%" }, p: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography mb={4} width="100%" fontWeight={600} fontSize={22}>Skill Level Distribution</Typography>
        {loading ? (
            <CircularProgress />
        ) : error ? (
            <Typography color="error">{error}</Typography>
        ) : (
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                dataKey="value"
                data={skillLevelWise}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
                >
                {skillLevelWise.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
            </ResponsiveContainer>
        )}
        </Card>

        <Card variant="outlined" sx={{ width: "100%", p: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <Typography width="100%" fontWeight={600} fontSize={22}>Top Performers</Typography>
          {topPerformers?.map((tp, index) => (
            <Card key={index} variant="outlined" sx={{ width: "98%", display: "flex", justifyContent: "space-between", alignItems: "center", p: 3 }}>
                <Box sx={{ bgcolor: "#0f172a", px: 1.5, py: 0.5, borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Typography color="white" fontWeight={600}>{index + 1}</Typography>
                </Box>
                <Box sx={{ width: "80%", ml: 1 }}>
                    <Typography fontWeight={600}>{tp?.emp_name}</Typography>
                    <Typography fontSize={14}>{tp?.dept_name}</Typography>
                </Box>
                <Box sx={{ bgcolor: "#0f172a", px: 2, py: 0.3, borderRadius: 5 }}>
                    <Typography fontSize={12} color="white">{tp?.score}/{tp?.max_score}</Typography>
                </Box>
            </Card>
          ))}
        </Card>
      </Box>
    </Container>
  );
}
