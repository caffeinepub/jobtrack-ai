import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Types "types/applications";
import ApplicationsMixin "mixins/applications-api";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let applications : Map.Map<Nat, Types.Application> = Map.empty<Nat, Types.Application>();
  let nextAppId : [var Nat] = [var 1];
  let grokApiKeys : Map.Map<Types.UserId, Text> = Map.empty<Types.UserId, Text>();

  include ApplicationsMixin(accessControlState, applications, nextAppId, grokApiKeys);
};
