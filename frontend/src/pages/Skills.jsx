import { useEffect, useState } from "react";
import axios from "../axios/axiosInstance";
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Typography,
  Grid,
  Card,
  CardContent,
  Modal,
  Menu,
  MenuItem,
  TextField,
  Stack,
  CircularProgress
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import SkillGraphView from "../components/SkillGraphView";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

export default function Skills() {
  const [groupedSkills, setGroupedSkills] = useState({});
  const [open, setOpen] = useState(false);
  const [skillName, setSkillName] = useState("");
  const [skillCategory, setSkillCategory] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newMaxScore, setNewMaxScore] = useState("");
  const [selectedSkillForGraph, setSelectedSkillForGraph] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/skills/all");
      groupByCategory(res.data);
    } catch (err) {
      toast.error(err?.response?.data.message || "Failed to fetch skills");
      setGroupedSkills({});
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = async () => {
    setIsLoading(true);
    try {
      await axios.post("/skills/add", { skillName, skillCategory });
      toast.success("Skill added successfully");
      fetchSkills();
      handleClose();
    } catch (err) {
      toast.error(err?.response?.data.message || "Failed to add skill");
    } finally {
      setIsLoading(false);
    }
  };

  const groupByCategory = (data) => {
    const grouped = {};
    data.forEach((skill) => {
      const category = skill.skill_category || "Uncategorized";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(skill);
    });
    setGroupedSkills(grouped);
  };

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setSkillName("");
    setSkillCategory("");
  };

  const handleClear = () => {
    setSkillName("");
    setSkillCategory("");
  };

  const handleMenuClick = (event, skill) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedSkill(skill);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditSkill = () => {
    if (!selectedSkill) return;
    setSkillName(selectedSkill.skill_name);
    setNewMaxScore("");
    setEditModalOpen(true);
    handleMenuClose();
  };

  const handleDeleteSkill = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`/skills/remove/${selectedSkill.skill_id}`);
      toast.success("Skill deleted successfully");
      fetchSkills();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error deleting skill");
    } finally {
      handleMenuClose();
      setSelectedSkill(null);
      setIsLoading(false);
    }
  };

  const handleEditSkillLevel = async () => {
    if (!selectedSkill) return;
    setIsLoading(true);
    try {
      await axios.put(`/skills/edit/${selectedSkill.skill_id}`, { max_score: newMaxScore });
      toast.success("Skill level updated successfully");
      fetchSkills();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error updating skill level");
    } finally {
      handleEditModalClose();
      setIsLoading(false);
    }
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedSkill(null);
    setNewMaxScore("");
  };

  const handleSkillCardClick = (skill) => {
    setSelectedSkillForGraph(skill);
  };

  const handleGraphViewClose = () => {
    setSelectedSkillForGraph(null);
  };

  const handleViewGraph = () => {
    if (!selectedSkill) return;
    setSelectedSkillForGraph(selectedSkill);
    handleMenuClose();
  };

  return (
    <Container disableGutters maxWidth={false} sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 4, px: { xs: 2, sm: 3, md: 4, lg: 0 } }}>
      {selectedSkillForGraph ? (
        <SkillGraphView skill={selectedSkillForGraph} onClose={handleGraphViewClose} />
      ) : (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h5" fontWeight="bold">Skills</Typography>
              <Typography sx={{ color: "#64748b" }}>Manage and track skills across your organization</Typography>
            </Box>
            <Button variant="contained" size="small" sx={{ bgcolor: "black" }} onClick={handleOpen}>
              Add Skill
            </Button>
          </Box>

          <TextField
            placeholder="Search skills..."
            variant="outlined"
            fullWidth
            sx={{ width: { xs: "100%", lg: "55%" }, "& .MuiInputBase-root": { height: 40 } }}
            onChange={(e) => {
              const value = e.target.value.toLowerCase();
              if (!value) return fetchSkills();

              const filtered = {};
              Object.entries(groupedSkills).forEach(([category, skills]) => {
                const matched = skills.filter(skill =>
                  skill.skill_name.toLowerCase().includes(value)
                );
                if (matched.length > 0) filtered[category] = matched;
              });
              setGroupedSkills(filtered);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }
            }}
          />

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress />
              <Typography ml={2}>Loading skills...</Typography>
            </Box>
          ) : (
            Object.keys(groupedSkills).length > 0 ? (
              Object.entries(groupedSkills).map(([category, skills]) => (
                <Card key={category} variant="outlined">
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>{category}</Typography>
                    <Grid container spacing={2}>
                      {skills.map((skill) => (
                        <Grid size={{ xs: 6, md: 4 }} key={skill.skill_id}> 
                          <Card
                            variant="outlined"
                            sx={{ p: 2, ":hover": { bgcolor: "#f9fafb", cursor: "pointer" }, width: "100%" }}
                            onClick={() => handleSkillCardClick(skill)}
                          >
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Typography fontWeight="medium">{skill.skill_name}</Typography>
                              <IconButton size="small" onClick={(e) => handleMenuClick(e, skill)}>
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <Typography fontSize={14} sx={{ color: "gray" }}>
                              {skill.employee_count || 0} employee{(skill.employee_count || 0) !== 1 ? "s" : ""}
                            </Typography>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography variant="p" sx={{ width: "100%", textAlign: "center", marginY: 2, color: "#64748b" }}>No skills found</Typography>
            )
          )}

          <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle}>
              <Typography variant="h6" fontWeight="bold">Add Skill</Typography>
              <TextField label="Skill Name" value={skillName} onChange={(e) => setSkillName(e.target.value)} fullWidth />
              <TextField label="Skill Category" value={skillCategory} onChange={(e) => setSkillCategory(e.target.value)} fullWidth />
              <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
                <Button onClick={handleClose} variant="outlined" color="inherit">Cancel</Button>
                <Button onClick={handleClear} variant="outlined" color="warning">Clear</Button>
                <Button onClick={addSkill} variant="contained" sx={{ bgcolor: "black" }}>Add</Button>
              </Stack>
            </Box>
          </Modal>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "top", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              paper: {
                sx: {
                  boxShadow: "none",
                  border: "1px solid #e0e0e0",
                  minWidth: 120,
                },
              }
            }}
          >
            <MenuItem onClick={handleEditSkill}>Edit</MenuItem>
            <MenuItem onClick={handleDeleteSkill}>Delete</MenuItem>
            <MenuItem onClick={handleViewGraph}>View Graph</MenuItem>
          </Menu>

          <Modal open={editModalOpen} onClose={handleEditModalClose}>
            <Box sx={modalStyle}>
              <Typography variant="h6" fontWeight="bold">Edit Skill</Typography>
              <TextField label="Skill" value={skillName} fullWidth InputProps={{ readOnly: true }} />
              <TextField
                label="New Max Score"
                type="number"
                value={newMaxScore}
                onChange={(e) => setNewMaxScore(e.target.value)}
                fullWidth
              />
              <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
                <Button onClick={handleEditModalClose} variant="outlined" color="inherit">Cancel</Button>
                <Button onClick={handleEditSkillLevel} variant="contained" sx={{ bgcolor: "black" }}>Update</Button>
              </Stack>
            </Box>
          </Modal>
        </>
      )}
      <ToastContainer position="top-right" hideProgressBar autoClose={500} />
    </Container>
  );
}