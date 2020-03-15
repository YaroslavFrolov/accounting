export let TabContent = props => {
  return props.children.map(child=>{
    if( child.props.tabName !== props.activeTab ) return null;

    return child;
  })
};
