import { useEffect, useState } from "react";
import axios from "../axios/axiosInstance";
import {
  Box,
  Button,
  Container,
  IconButton,
  Typography,
  Grid,
  Card,
  CardContent,
  Modal,
  Menu,
  MenuItem,
  TextField,
  Stack
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import MoreVertIcon from "@mui/icons-material/MoreVert";

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

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await axios.get("/skills/all");
      groupByCategory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addSkill = async () => {
    try {
      await axios.post("/skills/add", {
        skillName,
        skillCategory,
      });
      fetchSkills();
      handleClose();
    } catch (err) {
      console.error("Error adding skill:", err);
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
    handleMenuClose();
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedSkill(null);
    setNewMaxScore("");
  };

  const handleDeleteSkill = async () => {
    await axios.delete(`/skills/remove/${selectedSkill.skill_id}`)
      .then((res) => {
        toast.success(res?.data.message || "Skill deleted successfully");
        handleMenuClose();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error deleting skill");
        handleMenuClose();
      });
    fetchSkills();
  };

  const handleEditSkillLevel = async () => {
    if (!selectedSkill) return;
    await axios.put(`/skills/edit/${selectedSkill.skill_id}`, { max_score: newMaxScore })
    .then((res) => {
      toast.success(res.data.message || "Skill level updated successfully");  
      fetchSkills();
      handleEditModalClose();
    })
    .catch((err) => {
      toast.error(err?.response?.data?.message || "Error updating skill level");
      handleEditModalClose();
    });
  };

  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 4 }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">Skills</Typography>
          <Typography sx={{ color: "#64748b" }}>Manage and track skills across your organization</Typography>
        </Box>
        <Button variant="contained" size="small" sx={{ bgcolor: "black" }} onClick={handleOpen}>Add Skill</Button>
      </Box>

      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" fontWeight="bold">Add Skill</Typography>
          <TextField
            label="Skill Name"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Skill Category"
            value={skillCategory}
            onChange={(e) => setSkillCategory(e.target.value)}
            fullWidth
          />
          <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
            <Button onClick={handleClose} variant="outlined" color="inherit">Cancel</Button>
            <Button onClick={handleClear} variant="outlined" color="warning">Clear</Button>
            <Button onClick={addSkill} variant="contained" color="primary">Add</Button>
          </Stack>
        </Box>
      </Modal>

      {Object.entries(groupedSkills).map(([category, skills]) => (
        <Card key={category} variant="outlined">
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              {category}
            </Typography>
            <Grid container spacing={2}>
              {skills.map((skill) => (
                <Grid key={skill.skill_id} size={{ xs: 12, md: 4 }}>
                  <Card variant="outlined" sx={{ p: 2, width: "100%", ":hover": { bgcolor: "#f9fafb" } }}>
                    <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography fontWeight="medium">{skill.skill_name}</Typography>
                      <IconButton size="small" onClick={(e) => handleMenuClick(e, skill)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography fontSize={14} sx={{ color: "gray" }}>
                      {skill.employee_count} employee{skill.employee_count !== 1 ? "s" : ""}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      ))}

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
          },
        }}
      >
        <MenuItem onClick={handleEditSkill}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteSkill}>Delete</MenuItem>
      </Menu>

      <Modal open={editModalOpen} onClose={handleEditModalClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" fontWeight="bold">Edit Skill</Typography>
          <TextField
            label="Skill"
            value={skillName}
            fullWidth
            slotProps={{ input: { readOnly: true } }}
          />
          <TextField
            label="New Max Score"
            type="number"
            value={newMaxScore}
            onChange={(e) => setNewMaxScore(e.target.value)}
            fullWidth
          />
          <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
            <Button onClick={handleEditModalClose} variant="outlined" color="inherit">Cancel</Button>
            <Button onClick={handleEditSkillLevel} variant="contained" color="primary">Update</Button>
          </Stack>
        </Box>
      </Modal>

      <ToastContainer position="top-right" hideProgressBar autoClose={500} />
    </Container>
  );
};