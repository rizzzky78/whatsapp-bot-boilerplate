/**
 * ROOT OF APP
 * WhatApp Web Client Library
 */

import { initCommandregister } from "./lib/utils/command-register/root";
import { error } from "./lib/utils/error";
import { connectToWhatsApp } from "./lib/websocket/root";

/**
 * Initializing and Regsitering the Command Module
 */
initCommandregister().catch(error);

/**
 * Make WASocket Connection
 */
connectToWhatsApp().catch(error);
