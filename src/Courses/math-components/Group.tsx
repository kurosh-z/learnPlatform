import React, { ReactElement } from 'react';

// type definitions
export type GroupAttribute = { update?: Object; set?: Object };
export type GroupAttributes = {
  [K in keyof any]: GroupAttribute;
};
export type GroupProps = {
  groupAttrs?: GroupAttributes;
};

/*Grouping the elements and  asign them  common attributes
    groupAtrs is an object with keys describing idex number (or any for every element): 
    index : index of the element in the gorup witch the attribute should be assigned to
    any:  set/update an attribute for every elements inside the group;

    values should be an object of type GroupAttribute: use set to set the attribute and update to update the current (current.attr + updated.attr)
    
  */
const Group: React.FC<GroupProps> = ({ children, groupAttrs = {} }) => {
  const rawDefalutlAttr = 'any' in groupAttrs ? groupAttrs['any'] : {};
  return (
    <>
      {React.Children.map(children, (child: ReactElement, idx: number) => {
        const cookedDefaultAttr = setupdate(rawDefalutlAttr, child);
        let childAttr =
          idx in groupAttrs
            ? { ...setupdate(groupAttrs[idx], child), ...cookedDefaultAttr }
            : cookedDefaultAttr;

        return React.cloneElement(child, {
          ...child.props,
          ...childAttr
        });
      })}
    </>
  );
};

export default Group;

const setupdate = (attr: GroupAttribute, child: ReactElement) => {
  let attr0 = {};
  if ('set' in attr) {
    attr0 = attr['set'];
  } else if ('update' in attr) {
    for (const key in attr['update']) {
      // if it should be updated: updatedvalue from attr object + currentvalue from child props

      // classNames can be undefined:
      let oldVal = child.props[key];
      if (!oldVal && typeof attr['update'][key] === 'string') oldVal = '';
      let newVal =
        typeof oldVal === 'string'
          ? attr['update'][key] + ' ' + oldVal
          : attr['update'][key] + oldVal;
      // console.log('name, old, new:, ', child, newVal);

      if (typeof oldVal !== typeof attr['update'][key])
        throw new Error(
          `expected both numbers or both strings but got: child.props.${key}: ${
            child.props[key]
          } of type:${typeof child.props[key]}  attr.update.${key}: ${
            attr['update'][key]
          } of type:${typeof attr['update'][key]} `
        );
      attr0[key] = newVal;
    }
  }
  return attr0;
};
