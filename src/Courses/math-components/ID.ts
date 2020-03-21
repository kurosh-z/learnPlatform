// // singletone class ID to keep just one instance of defs ID

// export default class ID {
//   private static instance: ID;
//   private ids: string[];

//   //make constructor private to prevent outside access
//   private constructor() {
//     this.ids = [];
//   }
//   // see: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
//   private randomID() {
//     return ([1e7].toString() + -2e5).replace(/[012]/g, c =>
//       (
//         c ^
//         (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
//       ).toString(16)
//     );
//   }
//   // static method controls the access to the instance
//   public static getInstance(): ID {
//     if (!ID.instance) {
//       ID.instance = new ID();
//     }
//     return ID.instance;
//   }
//   public makeID(): string {
//     const newID = 'defs_' + this.randomID();
//     this.ids.push(newID);

//     return newID;
//   }
//   public removeID(id: string) {
//     const index = this.ids.indexOf(id);
//     if (index === -1) throw new Error(`id:${id} is not exist!`);
//     else {
//       this.ids.splice(index, 1);
//     }
//   }
// }
