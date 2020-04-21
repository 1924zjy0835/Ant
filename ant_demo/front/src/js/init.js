// 面向对象的方式创建一个类
console.log("news..........");
// 1. 添加一个属性
// 通过this关键字，绑定属性，并且指定他的值
// 2. 绑定一个方法
// 通过类名.prototype就可以绑定了

// function Banner() {
//     // 这里面的代码就相当于是Python中的__init__中的代码
//     console.log('小蚂蚁！');
//     // 为当前的类添加一个属性
//     this.person = 'Ant';
// }
//
// // 原型链的技术为类添加方法
// // 为当前的类绑定一个方法
// Banner.prototype.greet = function (word) {
//   console.log('hello ', word);
// };
//
// // new一个对象
// var banner = new Banner();
// // 调用banner对象
// console.log(banner);
// console.log(banner.person);
// banner.greet('小蚂蚁');