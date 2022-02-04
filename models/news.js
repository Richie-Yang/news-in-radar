'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class News extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      News.hasMany(models.Comment, { foreignKey: 'newsId' })
      News.belongsToMany(models.User, {
        through: models.Like,
        foreignKey: 'newsId',
        as: 'LikedUsersForNews'
      })
    }
  }
  News.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    author: DataTypes.STRING,
    url: DataTypes.TEXT,
    urlToImage: DataTypes.STRING,
    totalLikes: DataTypes.INTEGER,
    totalComments: DataTypes.INTEGER,
    isSeed: DataTypes.BOOLEAN,
    publishedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'News',
    tabletName: 'News',
    underscored: true,
  });
  return News;
};