/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.policies.html
 */
function UsersControllerPolicies() {
  function anyUserPolicyChain() {
    return [
      'loadCurrentUser',
      'requireCurrentUser',
      'verifyUserApiPermissions'
    ]
  }

  return {
    '*': anyUserPolicyChain(),
    create: [],
    login: []
  }
}

function FeedsControllerPolicies() {
  // requires a feed, any user is allowed. User must have access to feed.
  function anyUserPolicyChain() {
    return [
      'loadCurrentUser',
      'requireCurrentUser',
      'requireIdParameter',
      'requireExistingFeed',
      'verifyFeedApiPermissions'
    ];
  }

  // requires a feed, requires current user to be an admin.
  function adminsOnlyPolicyChain() {
    return [
      'loadCurrentUser',
      'requireAdmin',
      'requireIdParameter',
      'requireExistingFeed',
      'verifyFeedApiPermissions'
    ];
  }

  // allow call to specify feedId
  function allowFeedIdParamChain(chain) {
    return chain.filter(function(policy) {
      return policy !== 'requireIdParameter'
        && policy !== 'requireExistingFeed';
    });
  }

  return {
    '*': anyUserPolicyChain(),
    addVideos: adminsOnlyPolicyChain(),
    find: allowFeedIdParamChain(anyUserPolicyChain())
  }
}

module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions (`true` allows public     *
  * access)                                                                  *
  *                                                                          *
  ***************************************************************************/

  DashboardController: {
    '*': ['loadCurrentUser', 'requireCurrentUser']
  },

  UsersController: UsersControllerPolicies(),
  FeedsController: FeedsControllerPolicies()
};
