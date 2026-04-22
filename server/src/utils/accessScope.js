const privilegedRoles = ["Admin", "Teacher"];

export const isPrivilegedUser = (role) => privilegedRoles.includes(role);

export const getStudentVisibilityFilter = (user) => {
  if (isPrivilegedUser(user.role)) {
    return {};
  }

  if (!user.linkedStudent) {
    return { _id: { $exists: false } };
  }

  return { _id: user.linkedStudent };
};

export const getStudentRecordFilter = (user, fieldName = "student") => {
  if (isPrivilegedUser(user.role)) {
    return {};
  }

  if (!user.linkedStudent) {
    return { [fieldName]: { $exists: false } };
  }

  return { [fieldName]: user.linkedStudent };
};
