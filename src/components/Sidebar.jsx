import Logo from "./Logo";
import Copyright from "./Copyright";

const Sidebar = () => {
    return (
      <div className='flex flex-col h-[855px] w-[500px] bg-[#2d3439] p-12' style={{ overscrollBehaviorY: 'none' }}>
         
         <div className="flex-1">
            <Logo/>
         </div>
         <div>
           <Copyright />
         </div>
         
      </div>
    );
  };
  
  export default Sidebar;
  