import { useEffect, useState } from "react";
import axios from "../axios/axiosInstance";
import {
    Box,
    Card,
    Container,
    Typography
} from "@mui/material";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Legend, Tooltip } from 'recharts';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ShowChartIcon from '@mui/icons-material/ShowChart';

export default function Dashboard() {
    const [empCount, setEmpCount] = useState(0);
    const [skillCount, setSkillCount] = useState(0);
    const [deptCount, setDeptCount] = useState(0);
    const [avgSkillLevel, setAvgSkillLevel] = useState({
        average_score: "",
        max_score: ""
    });
    const [chartData, setChartData] = useState([]);
    const [recents, setRecents] = useState([]);

    useEffect(() => {
        fetchEmpCount();
        fetchSkillCount();
        fetchDeptCount();
        fetchAvgSkillLevel();
        fetchGraphData();
        fetchRecentAssessments();
    }, []);

    const fetchEmpCount = async () => {
        await axios.get('/employees/all')
        .then((res) => setEmpCount(res.data.length))
        .catch((e) => console.error(e));
    };

    const fetchSkillCount = async () => {
        await axios.get("/skills/all")
        .then((res) => setSkillCount(res.data.length))
        .catch((e) => console.error(e));
    };

    const fetchDeptCount = async () => {
        await axios.get("/departments/all")
        .then((res) => setDeptCount(res.data.length))
        .catch((e) => console.error(e));
    };

    const fetchAvgSkillLevel = async () => {
        await axios.get("/skills/average")
        .then((res) => {
            setAvgSkillLevel({
                average_score: res.data[0].average_score,
                max_score: res.data[0].high_score
            });
        })
        .catch((e) => console.log(e));
    };

    const fetchGraphData = async() => {
        await axios.get("/analytics/quarter-wise", { params: { year: 2025 } })
        .then((res) => setChartData(res.data))
        .catch((e) => console.error(e));
    };

    const fetchRecentAssessments = async () => {
        await axios.get("/employees/recent")
        .then((res) => setRecents(res.data))
        .catch((e) => console.error(e));
    };

    return (
        <Container disableGutters maxWidth={false} sx={{ width: "100%" }}>
            <Box>
                <Typography variant="h5" fontWeight="bold">Dashboard</Typography>
                <Typography sx={{ color: "#64748b" }}>Overview of your organization's skill development and performance</Typography>
            </Box>
            <Box sx={{ width: "100%", marginY: 4, display: "flex", flexDirection: { sm: "column", lg: "row" }, gap: 2 }}>
                <Card variant="outlined" sx={{ width: { sm: "100%", lg: "25%" }, paddingX: 2, paddingY: 3, display: "flex", justifyContent: { sm: "space-between", lg: "center" }, gap: { lg: 3 } }}>
                    <Box>
                        <Typography fontSize={13} sx={{ color: "#64748b" }}>Total Employees</Typography>
                        <Typography variant="h5" fontWeight="bold">{empCount}</Typography>
                    </Box>
                    <Box sx={{ width: 56, height: 56, bgcolor: "#c2fac0", borderRadius: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <PeopleAltIcon />
                    </Box>
                </Card>
                <Card variant="outlined" sx={{ width: { sm: "100%", lg: "25%" }, paddingX: 2, paddingY: 3, display: "flex", justifyContent: { sm: "space-between", lg: "center" }, gap: { lg: 3 } }}>
                    <Box>
                        <Typography fontSize={13} sx={{ color: "#64748b" }}>Skills Tracked</Typography>
                        <Typography variant="h5" fontWeight="bold">{skillCount}</Typography>
                    </Box>
                    <Box sx={{ width: 56, height: 56, bgcolor: "#d9c0fa", borderRadius: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <WorkspacePremiumIcon />
                    </Box>
                </Card>
                <Card variant="outlined" sx={{ width: { sm: "100%", lg: "25%" }, paddingX: 2, paddingY: 3, display: "flex", justifyContent: { sm: "space-between", lg: "center" }, gap: { lg: 3 } }}>
                    <Box>
                        <Typography fontSize={13} sx={{ color: "#64748b" }}>Departments</Typography>
                        <Typography variant="h5" fontWeight="bold">{deptCount}</Typography>
                    </Box>
                    <Box sx={{ width: 56, height: 56, bgcolor: "#fac0d7", borderRadius: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <ApartmentIcon />
                    </Box>
                </Card>
                <Card variant="outlined" sx={{ width: { sm: "100%", lg: "25%" }, paddingX: 2, paddingY: 3, display: "flex", justifyContent: { sm: "space-between", lg: "center" }, gap: { lg: 3 } }}>
                    <Box>
                        <Typography fontSize={13} sx={{ color: "#64748b" }}>Avg. Skill Level</Typography>
                        <Typography variant="h5" fontWeight="bold">{avgSkillLevel?.average_score}/{avgSkillLevel?.max_score}</Typography>
                    </Box>
                    <Box sx={{ width: 56, height: 56, bgcolor: "#faeac0", borderRadius: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <ShowChartIcon />
                    </Box>
                </Card>
            </Box>
            <Box sx={{ width: "100%", display: "flex", flexDirection: { sm: "column", lg: "row" }, gap: 2 }}>
                <Card variant="outlined" sx={{ width: { sm: "100%", lg: "65%" }, paddingX: 2, paddingY: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <Typography variant="h5" fontWeight="bold" textAlign="left">Skill Level Over Time</Typography>
                        <Typography variant="h6">Year: {chartData[0]?.year}</Typography>
                    </Box>
                    <LineChart width={500} height={300} data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid stroke="#aaa" strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="average_score" stroke="purple" strokeWidth={2} name="Average Score" />
                        <XAxis dataKey="quarter" label={{ value: 'Quarter' }}/>
                        <YAxis width="auto" domain={[0, 10]} ticks={[2.5, 5, 7.5, 10]} label={{ value: 'Score', position: 'insideLeft', angle: -90 }} />
                        <Legend align="right" />
                        <Tooltip />
                    </LineChart>
                </Card>
                <Card variant="outlined" sx={{ width: { sm: "100%", lg: "35%" }, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, paddingBottom: 2 }}>
                    <Typography variant="h6" fontWeight="bold" textAlign="left" sx={{ marginX: 3, marginTop: 2, width: "90%" }}>Recent Assessments</Typography>
                    {recents.map((recent, index) => (
                        <Card key={index} variant="outlined" sx={{ width: "90%", padding: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box>
                                <Typography fontWeight="bold">{recent?.emp_name}</Typography>
                                <Typography fontSize={14}>{recent?.skill_name}</Typography>
                            </Box>
                            <Box sx={{ bgcolor: "#f1f5f9", paddingX: 3, paddingY: 0.5, borderRadius: 5 }}><Typography>{recent?.score}/10</Typography></Box>
                        </Card>
                    ))}
                </Card>
            </Box>
        </Container>
    );
};