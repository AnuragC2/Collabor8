import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import React, { useState } from 'react';

interface WorkspaceMenuProps {
    workspaceId: string; 
    workspaceName: string;
    onEdit: () => void; 
    onDelete: () => void;
}

export function WorkspaceMenu({ onEdit, onDelete }: WorkspaceMenuProps) {

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (_event?: object, _reason?: "backdropClick" | "escapeKeyDown") => {
        setAnchorEl(null);
    };

    const handleEdit = (event: React.MouseEvent) => {
        event.stopPropagation(); 
        handleClose(); 
        onEdit();
    };

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();
        handleClose();
        onDelete();
    };

    return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        aria-label="workspace options"
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}