'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Comment.belongsTo(models.News, { foreignKey: 'newsId' })
      Comment.belongsTo(models.User, { foreignKey: 'userId' })
      Comment.hasMany(Comment, {
        foreignKey: 'commentId',
        as: 'ReplyComments'
      })
      Comment.belongsTo(Comment, {
        foreignKey: 'commentId',
        as: 'RepliedComment'
      })
      Comment.belongsToMany(models.User, {
        through: models.Like,
        foreignKey: 'commentId',
        as: 'LikedUsersFromComments'
      })
    }
  }
  Comment.init({
    content: DataTypes.TEXT,
    media: DataTypes.STRING,
    totalLikes: DataTypes.INTEGER,
    newsId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    commentId: DataTypes.INTEGER,
    isSeed: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Comment',
    tableName: 'Comments',
    underscored: true
  })
  return Comment
}
