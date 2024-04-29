import { defineStore } from "pinia";

import { getAccountInfoApi, loginApi, logoutApi } from "@/api/account";
import { resetRouter } from "@/router";
import { store } from "@/store";

import { AccountInfo, AccountLoginDto } from "@/api/account/types";

import { useStorage } from "@vueuse/core";

export const useAccountStore = defineStore("account", () => {
  // state
  const token = useStorage("accessToken", "");
  const username = ref("");
  const roles = ref<Array<string>>([]); // 用户角色编码集合 → 判断路由权限

  /**
   * 登录调用
   *
   * @returns
   */
  function login(accountLoginDto: AccountLoginDto) {
    return new Promise<void>((resolve, reject) => {
      loginApi(accountLoginDto)
        .then((response) => {
          const { tokenType, accessToken } = response.data;
          token.value = tokenType + " " + accessToken; // Bearer eyJhbGciOiJIUzI1NiJ9.xxx.xxx
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // 获取信息(用户昵称、头像、角色集合、权限集合)
  function getAccountInfo() {
    return new Promise<AccountInfo>((resolve, reject) => {
      getAccountInfoApi()
        .then(({ data }) => {
          if (!data) {
            return reject("Verification failed, please Login again.");
          }
          if (!data.roles || data.roles.length <= 0) {
            reject("getAccountInfoApi: roles must be a non-null array!");
          }
          username.value = data.username;
          roles.value = data.roles;
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // 注销
  function logout() {
    return new Promise<void>((resolve, reject) => {
      logoutApi()
        .then(() => {
          resetRouter();
          resetToken();
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // 重置
  function resetToken() {
    token.value = "";
    username.value = "";
    roles.value = [];
  }

  return {
    token,
    username,
    roles,
    login,
    getAccountInfo,
    logout,
    resetToken,
  };
});

// 非setup
export function useAccountStoreHook() {
  return useAccountStore(store);
}