import { Tooltip } from "@chakra-ui/tooltip";
const TooltipCaria = (props) => {
  const { extra, children, content, placement } = props;
  return (
    <Tooltip
      placement={placement}
      label={content}
      className="w-max"
      {...props}
    >
      {children}
    </Tooltip>
  );
};

export default TooltipCaria;
