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
  InputLabel
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

  useEffect(() => {
    fetchYearOptions();
  }, []);

  useEffect(() => {
    if (skill?.skill_id && selectedYear !== "") {
      fetchGraphData(skill.skill_id, selectedYear);
    }
  }, [skill, selectedYear]);

  const fetchYearOptions = async () => {
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
    }
  };

  const fetchGraphData = async (skillId, year) => {
    try {
      const res = await axios.get(`/employees/by-skill?skillId=${skillId}&year=${year}`);
      const data = res.data;

      const employees = [...new Set(data.map(item => item.emp_name))];
      const quarters = ["Q1", "Q2", "Q3", "Q4"];

      if (employees.length === 1) {
        const transformed = quarters.map((q) => {
          const entry = data.find(d => d.quarter === q);
          return {
            quarter: q,
            score: entry ? parseFloat(entry.score) : 0,
          };
        });
        setGraphData(transformed);
      } else {
        const transformed = quarters.map((q) => {
          const entry = { quarter: q };
          employees.forEach(emp => {
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
    }
  };

  const isSingleEmployee = graphData.length > 0 && Object.prototype.hasOwnProperty.call(graphData[0], "score");

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

        {graphData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={graphData}>
              <XAxis dataKey="quarter" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              {isSingleEmployee ? (
                <Bar dataKey="score" name="Score" fill="#1976d2" />
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
          <Typography>No data available for this skill</Typography>
        )}
      </CardContent>
    </Card>
  );
};