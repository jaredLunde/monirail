# Monirail

Monitor Railway services and notify your team when anomalies are detected

> [!NOTE]
> This must be used with the [Bun](https://bun.sh) runtime

## API Documentation

### `monitor(options)`

A monitor is a background check that runs at a specified interval and triggers notifications when certain conditions are met.
You can use them to send automated alerts to your team from event data.

#### Match

Continously filter log events and trigger notifications when a match is found

#### Threshold

Trigger notifications when a metric or count of events exceeds a threshold

#### Availability

Trigger notifications when an HTTP service is unavailable

#### Custom

Trigger notifications when a custom condition is met

### `source(options)`

Sources are the data sources that monitors use to collect data from.

#### Environment Logs

Use Railway environment logs as a data source

#### Service HTTP Logs

Use Railway service HTTP logs as a data source

#### Metrics

Use Railway metrics as a data source

#### Service

Use a Railway service as a data source

### `notify(options)`

Notifications are the channels that monitors use to send alerts to your team.

#### Slack

Send a message to a Slack channel using the Incoming Webhook integration

https://slack.com/marketplace/A0F7XDUAZ-incoming-webhooks

#### Discord

Send a message to a Discord channel using a Webhook

#### PagerDuty

Send a message to a PagerDuty service using the Events API

#### Webhook

Send a payload to a Webhook URL

#### Custom

Send a custom notification, for example to a SendGrid email address

### `check(monitors)`

Run all monitors and send notifications if any conditions are met

### `watch(interval, monitors)`

Run all monitors at a specified interval and send notifications if any conditions are met

## Roadmap

- [ ] Anomaly detection
- [ ] Usage monitoring (spend)
- [ ] TCP proxy availability check
