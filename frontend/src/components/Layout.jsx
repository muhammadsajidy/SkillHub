import { useState } from 'react';
import { useNavigate } from "react-router";
import { useAuth } from '../hooks/useAuth';
import {
  AppBar,
  Avatar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ApartmentIcon from '@mui/icons-material/Apartment';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartIcon from '@mui/icons-material/BarChart';
import NotificationsIcon from '@mui/icons-material/Notifications';

const drawerWidth = 300;
const appBarHeight = 56;

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("user"));

  const { logout } = useAuth();

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const navLinks = [
    { text: "Dashboard", icon: <HomeIcon />, link: "/" },
    { text: "Assessments", icon: <AssessmentIcon />, link: "/assessments" },
    { text: "Employees", icon: <PeopleAltIcon />, link: "/employees" },
    { text: "Departments", icon: <ApartmentIcon />, link: "/departments" },
    { text: "Skills", icon: <WorkspacePremiumIcon />, link: "/skills" },
    { text: "Reports", icon: <BarChartIcon />, link: "/reports" },
  ];

  const drawerContent = (
    <List>
      {navLinks.map((link) => (
        <ListItem button="true" key={link.text} onClick={() => navigate(link.link)} sx={{ cursor: "pointer" }}>
          <ListItemIcon>{link.icon}</ListItemIcon>
          <ListItemText primary={link.text} />
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={toggleDrawer}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            display: { xs: 'none', md: 'block' },
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: "#fafafa",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", height: appBarHeight, ml: 2, gap: 3, borderBottom: '0.5px solid rgba(0, 0, 0, 0.12)' }}>
            <Typography fontSize={19} fontWeight="bold">SkillHub</Typography>
          </Box>
          {drawerContent}
        </Drawer>
      )}

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'auto' }}>
        <AppBar
          position="static"
          color="white"
          elevation={0}
          sx={{
            height: appBarHeight,
            borderBottom: '0.5px solid rgba(0, 0, 0, 0.12)',
            justifyContent: 'center',
          }}
        >
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            {isMobile && (
              <IconButton color="inherit" edge="start" onClick={toggleDrawer}>
                <MenuIcon />
              </IconButton>
            )}

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
              <IconButton onClick={handleAvatarClick}>
                <Avatar alt="User" src="" sx={{ width: 32, height: 32 }} />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{ mt: 1 }}
                slotProps={{ paper: { sx: { width: 200, maxWidth: '100%' } } }}
              >
                <MenuItem disabled>
                  <Box>
                    <Typography fontWeight={600}>{userData?.username}</Typography>
                    <Typography variant="body2" color="text.secondary">{userData?.role}</Typography>
                  </Box>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            px: { xs: 1, sm: 2, md: 3 },
            py: 2,
            width: '100%',
            maxWidth: '100%',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};