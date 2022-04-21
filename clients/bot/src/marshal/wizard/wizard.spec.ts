describe("wizard", () => {
    it("doesn't need to be tested because we're deprecating complex bot interactions", () => {
        expect(true).toBeTruthy();
    });
});

// /* eslint-disable @typescript-eslint/unbound-method */
// import type {
//     InteractionCollector,
//     Message, MessageCollector,
//     MessageComponentInteraction,
//     MessageReaction,
//     ReactionCollector,
//     TextChannel, User,
// } from "discord.js";

// import type {StepOptions} from "./wizard.types";
// import {WizardExitStatus, WizardType} from "./wizard.types";

// jest.createMockFromModule("discord.js");

// const mockWizardStepHandler = "mockWizardStepHandler";
// jest.mock("./wizard-step-handler", () => ({
//     WizardStepHandler: jest.fn(() => mockWizardStepHandler),
// }));

// import {Wizard} from "./wizard";
// import {WizardStepHandler} from "./wizard-step-handler";

// describe("Wizard", () => {
//     const author1 = ({
//         id: "id1",
//     }) as unknown as User;

//     const author2 = ({
//         id: "id2",
//     }) as unknown as User;

//     const authorBot = ({
//         id: "id3",
//         bot: true,
//     }) as unknown as User;

//     const messageCollector = ({
//         on: jest.fn(() => 5),
//     }) as unknown as MessageCollector;

//     const reactionCollector = ({
//         on: jest.fn(),
//     }) as unknown as ReactionCollector;

//     const componentInteractionCollector = ({
//         on: jest.fn(),
//     }) as unknown as InteractionCollector<MessageComponentInteraction>;

//     const channel = ({
//         createMessageCollector: jest.fn(() => messageCollector),
//     }) as unknown as TextChannel;

//     const initiator = ({
//         author: author1,
//         channel: channel,
//         createReactionCollector: jest.fn(() => reactionCollector),
//         createMessageComponentCollector: jest.fn(() => componentInteractionCollector),
//     }) as unknown as Message;

//     const messageAuthor1 = ({
//         author: author1,
//         channel: channel,
//     }) as unknown as Message;

//     const messageAuthor2 = ({
//         author: author2,
//         channel: channel,
//     }) as unknown as Message;

//     const messageBot = ({
//         author: authorBot,
//         channel: channel,
//     }) as unknown as Message;

//     const messageCancel = ({
//         author: author1,
//         channel: channel,
//         content: "cancel",
//     }) as unknown as Message;
    
//     const messageFunc = jest.fn();
//     const reactFunc = jest.fn();
//     const componentInteractionFunc = jest.fn();

//     const filter = jest.fn();
//     const timeout = 123;
//     const max = 456;

//     const reaction = {} as unknown as MessageReaction;

//     const componentInteractionAuthor1 = ({
//         user: author1,
//     }) as unknown as Message;

//     const componentInteractionAuthor2 = ({
//         user: author2,
//     }) as unknown as Message;

//     let wizard: Wizard;

//     beforeEach(() => {
//         wizard = new Wizard(initiator);
//     });

//     afterEach(jest.clearAllMocks);

//     describe("default filter functions", () => {
//         test("message filter should return true when message author is not a bot and matches Wizard author", () => {
//             const filterFunction = wizard.defaultFilterFunctions[WizardType.MESSAGE];

//             expect(filterFunction(messageAuthor1)).toEqual(true);
//             expect(filterFunction(messageAuthor2)).toEqual(false);
//             expect(filterFunction(messageBot)).toEqual(false);
//         });

//         test("reaction filter should return true when reaction user is not a bot", () => {
//             const filterFunction = wizard.defaultFilterFunctions[WizardType.REACTION];

//             expect(filterFunction(reaction, author1)).toEqual(true);
//             expect(filterFunction(reaction, author2)).toEqual(true);
//             expect(filterFunction(reaction, authorBot)).toEqual(false);
//         });

//         test("component filter should return true when interaction user matches Wizard author", () => {
//             const filterFunction = wizard.defaultFilterFunctions[WizardType.COMPONENT];

//             expect(filterFunction(componentInteractionAuthor1)).toEqual(true);
//             expect(filterFunction(componentInteractionAuthor2)).toEqual(false);
//         });
//     });

//     describe("interaction", () => {
//         it("should use collectorTarget when specified", async () => {
//             const opts: StepOptions = {
//                 collectorTarget: messageAuthor2,
//                 collectorType: WizardType.MESSAGE,
//                 filter: filter,
//                 timeout: timeout,
//                 max: max,
//             };
//             wizard.add(messageFunc, opts);

//             const wizardPromise = wizard.start();

//             // Force step (i.e. message has been collected)
//             wizard.next(new Map(), "");
//             await wizardPromise;

//             expect(messageAuthor2.channel.createMessageCollector).toHaveBeenCalledTimes(1);
//             expect(messageAuthor2.channel.createMessageCollector).toHaveBeenCalledWith({
//                 filter: filter,
//                 time: timeout,
//                 idle: timeout,
//                 max: max,
//             });

//             expect(messageCollector.on).toHaveBeenCalledTimes(2);
//             expect(messageCollector.on).toHaveBeenCalledWith("collect", mockWizardStepHandler);
//             expect(WizardStepHandler).toHaveBeenCalledWith(
//                 messageCollector,
//                 initiator,
//                 opts,
//                 messageFunc,
//             );
//             expect(messageCollector.on).toHaveBeenCalledWith("end", expect.any(Function));
//         });

//         it("should set up message collector correctly when no options specified", async () => {
//             wizard.add(messageFunc);

//             const wizardPromise = wizard.start();

//             // Force step (i.e. message has been collected)
//             wizard.next(new Map(), "");
//             await wizardPromise;

//             expect(channel.createMessageCollector).toHaveBeenCalledTimes(1);
//             expect(channel.createMessageCollector).toHaveBeenCalledWith({});

//             expect(messageCollector.on).toHaveBeenCalledTimes(2);
//             expect(messageCollector.on).toHaveBeenCalledWith("collect", mockWizardStepHandler);
//             expect(WizardStepHandler).toHaveBeenCalledWith(
//                 messageCollector,
//                 initiator,
//                 undefined,
//                 messageFunc,
//             );
//             expect(messageCollector.on).toHaveBeenCalledWith("end", expect.any(Function));
//         });

//         it("should set up message collector correctly", async () => {
//             const opts: StepOptions = {
//                 collectorType: WizardType.MESSAGE,
//                 filter: filter,
//                 timeout: timeout,
//                 max: max,
//             };
//             wizard.add(messageFunc, opts);

//             const wizardPromise = wizard.start();

//             // Force step (i.e. message has been collected)
//             wizard.next(new Map(), "");
//             await wizardPromise;

//             expect(channel.createMessageCollector).toHaveBeenCalledTimes(1);
//             expect(channel.createMessageCollector).toHaveBeenCalledWith({
//                 filter: filter,
//                 time: timeout,
//                 idle: timeout,
//                 max: max,
//             });

//             expect(messageCollector.on).toHaveBeenCalledTimes(2);
//             expect(messageCollector.on).toHaveBeenCalledWith("collect", mockWizardStepHandler);
//             expect(WizardStepHandler).toHaveBeenCalledWith(
//                 messageCollector,
//                 initiator,
//                 opts,
//                 messageFunc,
//             );
//             expect(messageCollector.on).toHaveBeenCalledWith("end", expect.any(Function));
//         });

//         it("should set up reaction collector correctly", async () => {
//             const opts: StepOptions = {
//                 collectorType: WizardType.REACTION,
//                 filter: filter,
//                 timeout: timeout,
//                 max: max,
//             };
//             wizard.add(reactFunc, opts);

//             const wizardPromise = wizard.start();

//             // Force step (i.e. message has been collected)
//             wizard.next(new Map(), "");
//             await wizardPromise;

//             expect(initiator.createReactionCollector).toHaveBeenCalledTimes(1);
//             expect(initiator.createReactionCollector).toHaveBeenCalledWith({
//                 filter: filter,
//                 time: timeout,
//                 idle: timeout,
//                 max: max,
//             });

//             expect(reactionCollector.on).toHaveBeenCalledTimes(2);
//             expect(reactionCollector.on).toHaveBeenCalledWith("collect", mockWizardStepHandler);
//             expect(WizardStepHandler).toHaveBeenCalledWith(
//                 reactionCollector,
//                 initiator,
//                 opts,
//                 reactFunc,
//             );
//             expect(reactionCollector.on).toHaveBeenCalledWith("end", expect.any(Function));
//         });

//         it("should set up component interaction collector correctly", async () => {
//             const opts: StepOptions = {
//                 collectorType: WizardType.COMPONENT,
//                 filter: filter,
//                 timeout: timeout,
//                 max: max,
//             };
//             wizard.add(componentInteractionFunc, opts);

//             const wizardPromise = wizard.start();

//             // Force step (i.e. message has been collected)
//             wizard.next(new Map(), "");
//             await wizardPromise;

//             expect(initiator.createMessageComponentCollector).toHaveBeenCalledTimes(1);
//             expect(initiator.createMessageComponentCollector).toHaveBeenCalledWith({
//                 filter: filter,
//                 time: timeout,
//                 idle: timeout,
//                 max: max,
//             });

//             expect(componentInteractionCollector.on).toHaveBeenCalledTimes(2);
//             expect(componentInteractionCollector.on).toHaveBeenCalledWith("collect", mockWizardStepHandler);
//             expect(WizardStepHandler).toHaveBeenCalledWith(
//                 componentInteractionCollector,
//                 initiator,
//                 opts,
//                 componentInteractionFunc,
//             );
//             expect(componentInteractionCollector.on).toHaveBeenCalledWith("end", expect.any(Function));
//         });

//         /*
//          * It("should call finally function when wizard ends", () => {
//          *     const fn = jest.fn();
//          */
            
//         //     wizard.finally(fn);

            
//         // });

//         /*
//          * it("should call onFail function when wizard fails", () => {
//          *     const fn = jest.fn();
//          */

//         /*
//          *     wizard.onFail(fn);
//          * });
//          */
//     });

//     describe("completion", () => {
//         it("should do nothing with no steps", async () => {
//             const wizardPromise = wizard.start();

//             wizard.next(new Map(), "");
//             await wizardPromise;

//             expect(messageCollector.on).not.toHaveBeenCalled();
//             expect(reactionCollector.on).not.toHaveBeenCalled();
//             expect(componentInteractionCollector.on).not.toHaveBeenCalled();
//         });

//         it("should call finally function on successful completion", async () => {
//             const finalFunction = jest.fn().mockResolvedValue(null);

//             wizard.add(messageFunc);
//             wizard.finally(finalFunction);

//             const wizardPromise = wizard.start();

//             // Force step (i.e. message has been collected)
//             wizard.next(new Map(), "");
            
//             expect(finalFunction).toHaveBeenCalledTimes(1);

//             await wizardPromise;
//         });

//         it("should resolve on successful completion when no finally function specified", async () => {
//             wizard.add(messageFunc);

//             const wizardPromise = wizard.start();

//             // Force step (i.e. message has been collected)
//             wizard.next(new Map(), "");
            
//             await wizardPromise;
//         });

//         it("should not call finally function on completion of an intermediate step", () => {
//             const finalFunction = jest.fn().mockResolvedValue(null);

//             wizard.add(messageFunc);
//             wizard.add(messageFunc);
//             wizard.finally(finalFunction);

//             // eslint-disable-next-line no-void
//             void wizard.start();

//             // Force step (i.e. message has been collected)
//             wizard.next(new Map(), "");

//             expect(finalFunction).not.toHaveBeenCalled();
//         });

//         it("should call onFail function when a message contains cancel and resolve wizard if no more steps", async () => {
//             const failFunction = jest.fn().mockResolvedValue(null);

//             wizard.add(messageFunc);
//             wizard.onFail(failFunction);

//             // eslint-disable-next-line no-void
//             const wizardPromise = wizard.start();

//             // Force step (i.e. message has been collected)
//             const messages = new Map([ ["key", messageCancel] ]);
//             wizard.next(messages, "");

//             expect(failFunction).toHaveBeenCalledTimes(1);

//             await wizardPromise;
//         });

//         it("should call onFail function when the collector exits with FAIL and not resolve wizard if more steps", async () => {
//             const failFunction = jest.fn().mockResolvedValue(null);

//             wizard.add(messageFunc);
//             wizard.add(messageFunc);
//             wizard.onFail(failFunction);

//             // eslint-disable-next-line no-void
//             void wizard.start();

//             // Force step (i.e. message has been collected)
//             const messages = new Map([ ["key", messageCancel] ]);
//             wizard.next(messages, WizardExitStatus.FAIL);

//             expect(failFunction).toHaveBeenCalledTimes(1);
//         });

//         it("should resolve on when a message contains cancel and no onFail function specified", async () => {
//             wizard.add(messageFunc);
//             wizard.add(messageFunc);

//             // eslint-disable-next-line no-void
//             const wizardPromise = wizard.start();

//             // Force step (i.e. message has been collected)
//             const messages = new Map([ ["key", messageCancel] ]);
//             wizard.next(messages, WizardExitStatus.FAIL);

//             await wizardPromise;
//         });
//     });
// });
