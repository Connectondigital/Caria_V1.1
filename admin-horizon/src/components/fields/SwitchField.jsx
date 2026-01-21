import Switch from "components/switch";

const SwitchField = (props) => {
  const { id, label, desc, mt, mb, ...rest } = props;
  return (
    <div className={`flex justify-between ${mt} ${mb} items-center w-full`}>
      <label
        htmlFor={id}
        className="max-w-[80%] hover:cursor-pointer lg:max-w-[65%]"
      >
        <h5 className="text-base font-bold text-navy-700 dark:text-white">
          {label}
        </h5>
        <p className={`text-base text-gray-600`}>{desc}</p>
      </label>
      <div>
        <Switch id={id} {...rest} />
      </div>
    </div>
  );
};

export default SwitchField;
