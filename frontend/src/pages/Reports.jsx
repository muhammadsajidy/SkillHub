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
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchDepartmentWise(),
          fetchSkillLevelWise(),
          fetchTopPerformers()
        ]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
      console.error("Error fetching department-wise data:", e);
      setError("Could not load department skill levels.");
      throw e;
    }
  };

  const fetchTopPerformers = async () => {
    try {
      const { data } = await axios.get("/analytics/top-performers");
      setTopPerformers(data);
    } catch (e) {
      console.error("Error fetching top performers data:", e);
      setError("Could not load top performers.");
      throw e;
    }
  };

  const fetchSkillLevelWise = async () => {
    try {
      const { data: raw } = await axios.get("/analytics/skilllevel-wise");
      const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
      const transformed = skillLevels.map(level => {
        const match = raw.find(item => item.skill_level === level);
        return {
          name: level,
          value: match ? Number(match.count) : 0
        };
      });
      setSkillLevelWise(transformed);
    } catch (e) {
      console.error("Error fetching skill level data:", e);
      setError("Could not load skill level distribution.");
      throw e;
    }
  };

  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{ width: "100%", display: "flex", flexDirection: "column", px: { xs: 2, sm: 3, md: 1, lg: 0 } }}
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
        {loading ? (
          <Box sx={{ width: '100%', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
            <Typography ml={2}>Loading reports...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ width: '100%', textAlign: 'center', mt: 4 }}>
            <Typography color="error" variant="h6">{error}</Typography>
            <Typography color="text.secondary">Please try reloading the page or check your connection.</Typography>
          </Box>
        ) : (
          <>
            <Card variant="outlined" sx={{
              width: { xs: "100%", lg: "calc(50% - 8px)" },
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxSizing: 'border-box',
              minHeight: 400
            }}>
              <Typography mb={4} width="100%" fontWeight={600} fontSize={22}>Average Skill Level by Department</Typography>
              {departmentWise.length > 0 ? (
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
              ) : (
                <Typography color="text.secondary">No department data available.</Typography>
              )}
            </Card>

            <Card
              variant="outlined"
              sx={{
                width: { xs: "100%", lg: "calc(50% - 8px)" },
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                boxSizing: 'border-box',
                minHeight: 400
              }}>
              <Typography mb={4} width="100%" fontWeight={600} fontSize={22}>Skill Level Distribution</Typography>
              {skillLevelWise.some(entry => entry.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={skillLevelWise}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {skillLevelWise.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary">No skill level distribution data available.</Typography>
              )}
            </Card>

            <Card variant="outlined" sx={{
              width: "100%",
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              boxSizing: 'border-box'
            }}>
              <Typography width="100%" fontWeight={600} fontSize={22}>Top Performers</Typography>
              {topPerformers.length > 0 ? (
                topPerformers.map((tp, index) => (
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
                ))
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center' }}>No top performers data available.</Typography>
              )}
            </Card>
          </>
        )}
      </Box>
    </Container>
  );
}