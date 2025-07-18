import { useEffect, useState } from "react";
import axios from "../axios/axiosInstance";
import {
    Box,
    Card,
    Container,
    Typography,
    CircularProgress
} from "@mui/material";
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
    const [recents, setRecents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                await Promise.all([
                    fetchEmpCount(),
                    fetchSkillCount(),
                    fetchDeptCount(),
                    fetchAvgSkillLevel(),
                    fetchRecentAssessments()
                ]);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const fetchEmpCount = async () => {
        try {
            const res = await axios.get('/employees/all');
            setEmpCount(res.data.length);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchSkillCount = async () => {
        try {
            const res = await axios.get("/skills/all");
            setSkillCount(res.data.length);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchDeptCount = async () => {
        try {
            const res = await axios.get("/departments/all");
            setDeptCount(res.data.length);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchAvgSkillLevel = async () => {
        try {
            const res = await axios.get("/skills/average");
            setAvgSkillLevel({
                average_score: res.data[0]?.average_score || 0,
                max_score: res.data[0]?.high_score || 10
            });
        } catch (e) {
            console.log(e);
        }
    };

    const fetchRecentAssessments = async () => {
        try {
            const res = await axios.get("/employees/recent");
            setRecents(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Container disableGutters maxWidth={false} sx={{ width: "100%", px: { xs: 2, sm: 3, md: 4 } }}>
            <Box>
                <Typography variant="h5" fontWeight="bold">Dashboard</Typography>
                <Typography sx={{ color: "#64748b" }}>Overview of your organization's skill development and performance</Typography>
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}>
                    <CircularProgress />
                    <Typography ml={2}>Loading dashboard data...</Typography>
                </Box>
            ) : (
                <>
                    <Box sx={{
                        width: "100%",
                        marginY: 4,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 2,
                        justifyContent: 'flex-start'
                    }}>
                        <Card variant="outlined" sx={{
                            flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)", lg: "1 1 calc(25% - 12px)" }, // 1 per row on xs, 2 per row on sm, 4 per row on lg
                            paddingX: 2,
                            paddingY: 3,
                            display: "flex",
                            justifyContent: { xs: "space-between", lg: "center" },
                            gap: { lg: 3 },
                            boxSizing: 'border-box'
                        }}>
                            <Box>
                                <Typography fontSize={13} sx={{ color: "#64748b" }}>Total Employees</Typography>
                                <Typography variant="h5" fontWeight="bold">{empCount}</Typography>
                            </Box>
                            <Box sx={{ width: 56, height: 56, bgcolor: "#c2fac0", borderRadius: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <PeopleAltIcon />
                            </Box>
                        </Card>
                        <Card variant="outlined" sx={{
                            flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)", lg: "1 1 calc(25% - 12px)" }, // 1 per row on xs, 2 per row on sm, 4 per row on lg
                            paddingX: 2,
                            paddingY: 3,
                            display: "flex",
                            justifyContent: { xs: "space-between", lg: "center" },
                            gap: { lg: 3 },
                            boxSizing: 'border-sizing'
                        }}>
                            <Box>
                                <Typography fontSize={13} sx={{ color: "#64748b" }}>Skills Tracked</Typography>
                                <Typography variant="h5" fontWeight="bold">{skillCount}</Typography>
                            </Box>
                            <Box sx={{ width: 56, height: 56, bgcolor: "#d9c0fa", borderRadius: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <WorkspacePremiumIcon />
                            </Box>
                        </Card>
                        <Card variant="outlined" sx={{
                            flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)", lg: "1 1 calc(25% - 12px)" }, // 1 per row on xs, 2 per row on sm, 4 per row on lg
                            paddingX: 2,
                            paddingY: 3,
                            display: "flex",
                            justifyContent: { xs: "space-between", lg: "center" },
                            gap: { lg: 3 },
                            boxSizing: 'border-box'
                        }}>
                            <Box>
                                <Typography fontSize={13} sx={{ color: "#64748b" }}>Departments</Typography>
                                <Typography variant="h5" fontWeight="bold">{deptCount}</Typography>
                            </Box>
                            <Box sx={{ width: 56, height: 56, bgcolor: "#fac0d7", borderRadius: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <ApartmentIcon />
                            </Box>
                        </Card>
                        <Card variant="outlined" sx={{
                            flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)", lg: "1 1 calc(25% - 12px)" }, // 1 per row on xs, 2 per row on sm, 4 per row on lg
                            paddingX: 2,
                            paddingY: 3,
                            display: "flex",
                            justifyContent: { xs: "space-between", lg: "center" },
                            gap: { lg: 3 },
                            boxSizing: 'border-box'
                        }}>
                            <Box>
                                <Typography fontSize={13} sx={{ color: "#64748b" }}>Avg. Skill Level</Typography>
                                <Typography variant="h5" fontWeight="bold">{avgSkillLevel?.average_score}/{avgSkillLevel?.max_score}</Typography>
                            </Box>
                            <Box sx={{ width: 56, height: 56, bgcolor: "#faeac0", borderRadius: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <ShowChartIcon />
                            </Box>
                        </Card>
                    </Box>

                    <Box sx={{ width: "100%", display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 2 }}>
                        <Card variant="outlined" sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, paddingBottom: 2 }}>
                            <Typography variant="h6" fontWeight="bold" textAlign="left" sx={{ marginX: 3, marginTop: 2, width: "90%" }}>Recent Assessments</Typography>
                            {recents.length > 0 ? (
                                recents.map((recent, index) => (
                                    <Card key={index} variant="outlined" sx={{ width: "90%", padding: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Box>
                                            <Typography fontWeight="bold">{recent?.emp_name}</Typography>
                                            <Typography fontSize={14}>{recent?.skill_name}</Typography>
                                        </Box>
                                        <Box sx={{ bgcolor: "#f1f5f9", paddingX: 3, paddingY: 0.5, borderRadius: 5 }}><Typography>{recent?.score}/10</Typography></Box>
                                    </Card>
                                ))
                            ) : (
                                <Typography sx={{ textAlign: "center", my: 2, color: "#64748b" }}>No recent assessments found.</Typography>
                            )}
                        </Card>
                    </Box>
                </>
            )}
        </Container>
    );
};