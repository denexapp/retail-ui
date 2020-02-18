import { css } from '../../lib/theming/Emotion';
import { Theme } from '../../lib/theming/Theme';

export const jsStyles = {
  cross(t: Theme) {
    return css`
      color: ${t.tooltipCloseBtnColor};
      cursor: pointer;
      height: 8px;
      line-height: 0;
      padding: 4px;
      position: absolute;
      right: 4px;
      top: 4px;
      width: 8px;

      &:hover {
        color: ${t.tooltipCloseBtnHoverColor};
      }
    `;
  },

  tooltipContent(t: Theme) {
    return css`
      padding: 15px 20px;
      position: relative;
    `;
  },
};
