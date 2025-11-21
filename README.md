# Collabor8

Main API Structure::

## ---------------------------------------------- ##

/api
├── /workspaces
│   ├── POST   /                                    - Create workspace
│   ├── GET    /my-workspaces                       - Get user's workspaces
│   ├── GET    /:workspaceId                        - Get workspace
│   ├── PATCH  /:workspaceId                        - Update workspace
│   ├── DELETE /:workspaceId                        - Delete workspace
│   └── /members
│       ├── POST   /:workspaceId/members            - Add member
│       ├── DELETE /:workspaceId/members/:memberId  - Remove member
│       └── PATCH  /:workspaceId/members/:memberId/role
│
├── /projects
│   ├── POST   /workspace/:workspaceId/projects     - Create project
│   ├── GET    /workspace/:workspaceId/projects     - Get workspace projects
│   ├── GET    /:projectId                          - Get project
│   ├── PATCH  /:projectId                          - Update project
│   ├── POST   /:projectId/archive                  - Archive project
│   ├── DELETE /:projectId                          - Delete project
│   └── /members
│       ├── POST   /:projectId/members              - Add member
│       ├── DELETE /:projectId/members/:memberId    - Remove member
│       └── PATCH  /:projectId/members/:memberId/role
│
└── /tasks
    ├── POST   /project/:projectId/tasks            - Create task
    ├── GET    /project/:projectId/tasks            - Get project tasks
    ├── GET    /project/:projectId/tasks/stats      - Get task statistics
    ├── GET    /workspace/:workspaceId/my-tasks     - Get my assigned tasks
    ├── GET    /workspace/:workspaceId/reported-tasks - Get my reported tasks
    ├── GET    /workspace/:workspaceId/search       - Search tasks
    ├── GET    /:taskId                             - Get task by ID
    ├── GET    /key/:key                            - Get task by key (PROJ-123)
    ├── GET    /:taskId/subtasks                    - Get subtasks
    ├── PATCH  /:taskId                             - Update task
    ├── PATCH  /:taskId/status                      - Update status
    ├── POST   /:taskId/assign                      - Assign task
    ├── POST   /:taskId/unassign                    - Unassign task
    └── DELETE /:taskId                             - Delete task

    Comments Module: POST   /api/comments/task/:taskId/comments              - Create comment/reply
GET    /api/comments/task/:taskId/comments              - Get task comments
GET    /api/comments/task/:taskId/comments?includeReplies=true - Get with nested replies
GET    /api/comments/task/:taskId/comments/count        - Get comment count
GET    /api/comments/:commentId                         - Get specific comment
GET    /api/comments/:commentId/replies                 - Get comment replies
GET    /api/comments/:commentId/replies/count           - Get reply count
PATCH  /api/comments/:commentId                         - Update comment
DELETE /api/comments/:commentId                         - Delete comment & replies
GET    /api/comments/workspace/:workspaceId/my-comments - Get user's comments
GET    /api/comments/workspace/:workspaceId/recent-comments - Get recent comments
GET    /api/comments/workspace/:workspaceId/search      - Search comments