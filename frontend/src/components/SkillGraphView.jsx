import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import axios from "../axios/axiosInstance";

export default function SkillGraphView({ skill, onClose }) {
  const [graphData, setGraphData] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [employeeNames, setEmployeeNames] = useState([]); // To store employee names

  useEffect(() => {
    fetchYearOptions();
  }, []);

  useEffect(() => {
    if (skill?.skill_id && selectedYear !== "") {
      fetchGraphData(skill.skill_id, selectedYear);
    }
  }, [skill, selectedYear]);

  const fetchYearOptions = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/evaluations/years");
      const years = res.data;
      setYearOptions(years);
      const currentYear = new Date().getFullYear();
      setSelectedYear(years.includes(currentYear) ? currentYear : "all");
    } catch (err) {
      console.error("Failed to fetch years:", err);
      setYearOptions(["all"]);
      setSelectedYear("all");
      setGraphData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGraphData = async (skillId, year) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/employees/by-skill?skillId=${skillId}&year=${year}`);
      const data = res.data;

      const uniqueEmployeeNames = [...new Set(data.map(item => item.emp_name))];
      setEmployeeNames(uniqueEmployeeNames); // Store unique employee names

      const quarters = ["Q1", "Q2", "Q3", "Q4"];

      if (uniqueEmployeeNames.length === 1) {
        const transformed = quarters.map((q) => {
          const entry = data.find(d => d.quarter === q);
          return {
            quarter: q,
            score: entry ? parseFloat(entry.score) : 0,
            employeeName: uniqueEmployeeNames[0] // Add employee name directly for single employee
          };
        });
        setGraphData(transformed);
      } else {
        const transformed = quarters.map((q) => {
          const entry = { quarter: q };
          uniqueEmployeeNames.forEach(emp => {
            const found = data.find(d => d.emp_name === emp && d.quarter === q);
            entry[emp] = found ? parseFloat(found.score) : 0;
          });
          return entry;
        });
        setGraphData(transformed);
      }
    } catch (err) {
      console.error("Error fetching skill graph data:", err);
      setGraphData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const isSingleEmployee = employeeNames.length === 1;

  return (
    <Card variant="outlined" sx={{ width: "100%", maxWidth: 900, mx: "auto", mt: 4, p: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            {skill?.skill_name || "Skill"} — Employee Scores
          </Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>

        <FormControl fullWidth sx={{ maxWidth: 200, mb: 2 }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={selectedYear}
            label="Year"
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <MenuItem value="all">All Time</MenuItem>
            {yearOptions.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <CircularProgress />
            <Typography ml={2}>Loading graph data...</Typography>
          </Box>
        ) : (
          graphData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={graphData}>
                <XAxis dataKey="quarter" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} /> {/* Keep legend always to ensure consistent spacing if it appears and to show skill's single name, if needed, or employee's single name */}
                {isSingleEmployee ? (
                  <Bar dataKey="score" name={employeeNames[0]} fill="#1976d2" /> // Use employee's name here
                ) : (
                  Object.keys(graphData[0])
                    .filter(key => key !== "quarter")
                    .map((key, i) => (
                      <Bar key={key} dataKey={key} name={key} fill={`hsl(${i * 60}, 70%, 50%)`} />
                    ))
                )}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Typography>No data available for this skill in the selected year.</Typography>
          )
        )}
      </CardContent>
    </Card>
  );
};