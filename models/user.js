'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      User.hasMany(models.Comment, { foreignKey: 'userId' })
      User.belongsToMany(models.News, {
        through: models.Like,
        foreignKey: 'userId',
        as: 'LikedNewsForUsers'
      })
      User.belongsToMany(models.Comment, {
        through: models.Like,
        foreignKey: 'userId',
        as: 'LikedCommentForUsers'
      })
      User.belongsToMany(models.User, {
        through: models.Followship,
        foreignKey: 'followerId',
        as: 'Followings'
      })
      User.belongsToMany(models.User, {
        through: models.Followship,
        foreignKey: 'followingId',
        as: 'Followers'
      })
    }
  }
  User.init({
    name: DataTypes.STRING,
    image: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    description: DataTypes.TEXT,
    isAdmin: DataTypes.BOOLEAN,
    isSeed: DataTypes.BOOLEAN,
    totalComments: DataTypes.INTEGER,
    totalLikes: DataTypes.INTEGER,
    totalFollowers: DataTypes.INTEGER,
    totalFollowings: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    underscored: true
  })
  return User
}
