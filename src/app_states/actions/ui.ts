export const OPEN_NAV_PANEL = '[ui] open nav';
export const CLOSE_NAV_PANEL = '[ui] close nav';

export const openNavPanel = () => ({
  type: OPEN_NAV_PANEL,
});

export const closeNavPanel = () => ({
  type: CLOSE_NAV_PANEL,
});
