import {
  BluetoothRequired,
  CantOpenDevice,
  DeviceMangementKitError,
  DisconnectedDevice,
  DisconnectedDeviceDuringOperation,
  HwTransportError,
  HwTransportErrorType,
  LockedDeviceError,
  StatusCodes,
  TransportError,
  TransportExchangeTimeoutError,
  TransportInterfaceNotAvailable,
  TransportOpenUserCancelled,
  TransportRaceCondition,
  TransportStatusError,
  TransportWebUSBGestureRequired,
  UserRefusedAddress,
  UserRefusedOnDevice,
  getAltStatusMessage,
} from "./errors";

const named: Array<new (message?: string) => Error> = [
  BluetoothRequired,
  CantOpenDevice,
  DisconnectedDevice,
  DisconnectedDeviceDuringOperation,
  TransportOpenUserCancelled,
  TransportInterfaceNotAvailable,
  TransportRaceCondition,
  TransportWebUSBGestureRequired,
  TransportExchangeTimeoutError,
  UserRefusedOnDevice,
  UserRefusedAddress,
];

const cases: Array<[string, Error, string]> = [
  ["HwTransportError", new HwTransportError(HwTransportErrorType.Unknown, "boom"), "boom"],
  ["HwTransportError", new HwTransportError(HwTransportErrorType.Unknown, ""), "HwTransportError"],
  ["TransportError", new TransportError("boom", "Id"), "boom"],
  ["TransportError", new TransportError("", "Id"), ""],
  ["Dmk", new DeviceMangementKitError("Dmk", "boom"), "boom"],
  ["Dmk", new DeviceMangementKitError("Dmk", ""), "DeviceMangementKitError"],
  ["LockedDeviceError", new LockedDeviceError(), "Ledger device: Locked device (0x5515)"],
  ...named.flatMap((C): Array<[string, Error, string]> => [
    [C.name, new C(), C.name],
    [C.name, new C("custom"), "custom"],
  ]),
];

it.each(cases)("%s #%# has the expected name and message", (name, error, message) => {
  expect(error).toBeInstanceOf(Error);
  expect([error.name, error.message]).toEqual([name, message]);
});

it("carries the transport error type and id", () => {
  expect(new HwTransportError(HwTransportErrorType.BluetoothScanStartFailed, "x").type).toBe(
    "BluetoothScanStartFailed",
  );
  expect(new TransportError("x", "SomeId").id).toBe("SomeId");
});

it.each([
  [0x6700, "Incorrect length"],
  [0x6800, "Missing critical parameter"],
  [0x6982, "Security not satisfied (dongle locked or have invalid access rights)"],
  [0x6985, "Condition of use not satisfied (denied by the user?)"],
  [0x6a80, "Invalid data received"],
  [0x6b00, "Invalid parameter received"],
  [0x5515, "Locked device"],
  [0xb007, "Unexpected state on the device"],
  [0x6f00, "Internal error, please report"],
  [0x6fff, "Internal error, please report"],
  [0x6eff, undefined],
  [0x9000, undefined],
])("getAltStatusMessage(%i)", (code, expected) => {
  expect(getAltStatusMessage(code)).toBe(expected);
});

it.each([
  [
    0x6985,
    "CONDITIONS_OF_USE_NOT_SATISFIED",
    "Condition of use not satisfied (denied by the user?)",
  ],
  [StatusCodes.INS_NOT_SUPPORTED, "INS_NOT_SUPPORTED", "INS_NOT_SUPPORTED"],
  [0x1234, "UNKNOWN_ERROR", "UNKNOWN_ERROR"],
])("TransportStatusError(%i)", (code, statusText, text) => {
  const error = new TransportStatusError(code);
  expect([error.name, error.statusCode, error.statusText, error.message]).toEqual([
    "TransportStatusError",
    code,
    statusText,
    `Ledger device: ${text} (0x${code.toString(16)})`,
  ]);
});

it("maps a locked device status to a LockedDeviceError", () => {
  const mapped = new TransportStatusError(StatusCodes.LOCKED_DEVICE);
  expect(mapped).toBeInstanceOf(LockedDeviceError);
  expect([mapped.name, mapped.statusText, mapped.message]).toEqual([
    "LockedDeviceError",
    "LOCKED_DEVICE",
    "Ledger device: Locked device (0x5515)",
  ]);
  expect(
    new TransportStatusError(StatusCodes.LOCKED_DEVICE, { canBeMappedToChildError: false }),
  ).not.toBeInstanceOf(LockedDeviceError);
  expect(new LockedDeviceError("please unlock").message).toBe("please unlock");
});
