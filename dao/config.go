package dao

import (
	"errors"
	"fmt"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"h-ui/model/constant"
	"h-ui/model/entity"
	"time"
)

func SaveConfig(config entity.Config) (int64, error) {
	if tx := sqliteDB.Save(&config); tx.Error != nil {
		logrus.Errorf(fmt.Sprintf("%v", tx.Error))
		return 0, errors.New(constant.SysError)
	}
	return *config.Id, nil
}

func UpdateConfig(keys []string, updates map[string]interface{}) error {
	if len(updates) > 0 {
		updates["update_time"] = time.Now()
		if tx := sqliteDB.Model(&entity.Config{}).
			Where("key in ?", keys).
			Updates(updates); tx.Error != nil {
			logrus.Errorf(fmt.Sprintf("%v", tx.Error))
			return errors.New(constant.SysError)
		}
	}
	return nil
}

func GetConfig(query interface{}, args ...interface{}) (entity.Config, error) {
	var config entity.Config
	if tx := sqliteDB.Model(&entity.Config{}).
		Where(query, args...).First(&config); tx.Error != nil {
		if tx.Error == gorm.ErrRecordNotFound {
			return config, errors.New(constant.ConfigNotExist)
		}
		logrus.Errorf(fmt.Sprintf("%v", tx.Error))
		return config, errors.New(constant.SysError)
	}
	return config, nil
}

func ListConfig(query interface{}, args ...interface{}) ([]entity.Config, error) {
	var configs []entity.Config
	if tx := sqliteDB.Model(&entity.Config{}).
		Where(query, args...).Order("create_time desc").Find(&configs); tx.Error != nil {
		logrus.Errorf(fmt.Sprintf("%v", tx.Error))
		return configs, errors.New(constant.SysError)
	}
	return configs, nil
}
