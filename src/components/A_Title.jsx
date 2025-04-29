// // function A_Title() {
// //     return (
// //       <h1 className="A_Ttile">I'm a button</h1>
// //     );
// // }
// //functional class




// import React from "react";

// export default class A_Title extends React.Component {
//     render() {
//         return ( <h2 className="A_Ttile">My bf: {users.name}</h2> );
//     }
// }
// //class class


// const users = {
//     name: 'Vladik',
//     age: 19,
//     pet: 'cat'
// }

import React from 'react'

export default class A_Title extends React.Component {
  render() {
    return <h2 className="A_Title">{this.props.name}</h2>
  }
}